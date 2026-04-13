import { getFirebaseAdminAuth, getFirebaseApiKey } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function resolveToken(input?: string | NextRequest) {
  if (!input) return undefined;
  if (typeof input === "string") return input;

  const authHeader = input.headers.get("authorization") ?? input.headers.get("Authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const firebaseToken = input.headers.get("x-firebase-token");
  return firebaseToken?.trim() || undefined;
}

export async function getSessionUser(input?: string | NextRequest) {
  const token = resolveToken(input);
  if (!token) {
    return null;
  }

  try {
    const auth = await getFirebaseAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    const normalizedEmail = decodedToken.email?.toLowerCase();
    const isAdminEmail = normalizedEmail ? adminEmails.includes(normalizedEmail) : false;

    const createEmail = decodedToken.email || `${decodedToken.uid}@firebase.local`;
    const createName = decodedToken.name || decodedToken.email?.split("@")[0] || "User";

    const updateData: {
      email?: string;
      name?: string;
      image?: string | null;
      emailVerified?: boolean;
      role?: "ADMIN";
    } = {};

    if (decodedToken.email) updateData.email = decodedToken.email;
    if (decodedToken.name) updateData.name = decodedToken.name;
    if (decodedToken.picture !== undefined) updateData.image = decodedToken.picture ?? null;
    if (decodedToken.email_verified !== undefined) updateData.emailVerified = !!decodedToken.email_verified;
    if (isAdminEmail) updateData.role = "ADMIN";

    const dbUser = await prisma.user.upsert({
      where: { id: decodedToken.uid },
      create: {
        id: decodedToken.uid,
        email: createEmail,
        name: createName,
        image: decodedToken.picture || null,
        emailVerified: !!decodedToken.email_verified,
        role: isAdminEmail ? "ADMIN" : "USER",
      },
      update: updateData,
      select: { id: true, email: true, name: true, image: true, role: true },
    });

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
      role: dbUser.role,
    };
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null;
  }
}

export async function getCurrentUserRole(input?: string | NextRequest) {
  const user = await getSessionUser(input);
  if (!user) return null;

  return user.role ?? null;
}

export async function requireAdmin(input?: string | NextRequest) {
  const user = await getSessionUser(input);

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
      user: null,
    };
  }

  if (user.role !== "ADMIN") {
    return {
      ok: false as const,
      status: 403,
      message: "Admin access required",
      user,
    };
  }

  return {
    ok: true as const,
    user,
  };
}
