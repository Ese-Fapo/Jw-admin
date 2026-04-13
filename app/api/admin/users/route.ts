import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { toIsoDateTime } from "@/lib/firestore-data";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const db = await getFirebaseAdminDb();
    const users = (await db.collection("users").get()).docs
      .map((doc) => doc.data())
      .map((user) => ({
        id: String(user.id),
        name: String(user.name ?? "User"),
        email: String(user.email ?? ""),
        role: user.role === "ADMIN" ? "ADMIN" : "USER",
        emailVerified: Boolean(user.emailVerified),
        createdAt: toIsoDateTime(user.createdAt),
        updatedAt: toIsoDateTime(user.updatedAt),
      }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
