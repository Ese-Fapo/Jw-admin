import { getFirebaseAdminAuth, getFirebaseApiKey } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

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
    
    const dbUser = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
      select: { id: true, email: true, name: true, image: true, role: true },
    });

    if (!dbUser) return null;

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
