import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { nowMs } from "@/lib/firestore-data";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await getFirebaseAdminDb();
    const userSnapshot = await db.collection("users").where("email", "==", email).limit(1).get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "User not found. The user must sign in at least once before assignment." },
        { status: 404 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    await userDoc.ref.set(
      {
        role: "ADMIN",
        updatedAt: nowMs(),
      },
      { merge: true }
    );

    const updated = {
      id: String(userData.id ?? userDoc.id),
      email: String(userData.email ?? email),
      name: String(userData.name ?? "User"),
      role: "ADMIN",
    };

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Failed to assign admin role", error);
    return NextResponse.json({ error: "Failed to assign admin role" }, { status: 500 });
  }
}
