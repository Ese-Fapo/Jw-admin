import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

export async function getCurrentUserRole() {
  const user = await getSessionUser();
  if (!user) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    return dbUser?.role ?? null;
  } catch (error) {
    console.error("Failed to read current user role:", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
      user: null,
    };
  }

  const role = await getCurrentUserRole();
  if (role !== "ADMIN") {
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
