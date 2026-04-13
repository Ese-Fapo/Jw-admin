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
    const history = (await db.collection("adminSignInHistory").get()).docs
      .map((doc) => doc.data())
      .map((row) => ({
        id: String(row.id),
        adminUserId: String(row.adminUserId),
        adminEmail: String(row.adminEmail),
        method: String(row.method),
        createdAt: toIsoDateTime(row.createdAt),
      }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 200);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to fetch admin history", error);
    return NextResponse.json({ error: "Failed to fetch admin history" }, { status: 500 });
  }
}
