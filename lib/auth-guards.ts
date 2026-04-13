import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/domain-types";
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

    const db = await getFirebaseAdminDb();
    const userRef = db.collection("users").doc(decodedToken.uid);
    const userSnap = await userRef.get();
    const existing = (userSnap.exists ? userSnap.data() : null) as {
      role?: UserRole;
      createdAt?: number;
    } | null;

    const role: UserRole = isAdminEmail || existing?.role === "ADMIN" ? "ADMIN" : "USER";
    const now = Date.now();
    const syncedUser = {
      id: decodedToken.uid,
      email: decodedToken.email || `${decodedToken.uid}@firebase.local`,
      name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
      image: decodedToken.picture ?? null,
      emailVerified: !!decodedToken.email_verified,
      role,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await userRef.set(syncedUser, { merge: true });

    return {
      id: syncedUser.id,
      email: syncedUser.email,
      name: syncedUser.name,
      image: syncedUser.image,
      role: syncedUser.role,
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
