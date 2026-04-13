import { NextRequest, NextResponse } from "next/server";
import { isServiceAssignmentCategory } from "@/lib/domain-types";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { nowMs, weekKeyFromInput } from "@/lib/firestore-data";
import { requireAdmin } from "@/lib/auth-guards";

function parseWeekDate(value: string | null) {
  return weekKeyFromInput(value);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const { id } = await params;
    const body = await request.json();

    const data: {
      weekOf?: string;
      category?: string;
      title?: string;
      assigneeName?: string;
      assistantName?: string | null;
      dayLabel?: string | null;
      timeLabel?: string | null;
      notes?: string | null;
      position?: number;
      updatedAt?: number;
    } = {};

    if (body.weekOf !== undefined) {
      const weekOf = parseWeekDate(String(body.weekOf));
      if (!weekOf) return NextResponse.json({ error: "Invalid weekOf" }, { status: 400 });
      data.weekOf = weekOf;
    }

    if (body.category !== undefined) {
      const category = String(body.category);
      if (!isServiceAssignmentCategory(category)) {
        return NextResponse.json({ error: "Invalid category value" }, { status: 400 });
      }
      data.category = category;
    }

    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.assigneeName !== undefined) data.assigneeName = String(body.assigneeName).trim();
    if (body.assistantName !== undefined) data.assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    if (body.dayLabel !== undefined) data.dayLabel = body.dayLabel ? String(body.dayLabel).trim() : null;
    if (body.timeLabel !== undefined) data.timeLabel = body.timeLabel ? String(body.timeLabel).trim() : null;
    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null;
    if (body.position !== undefined) data.position = Number(body.position);

    data.updatedAt = nowMs();
    const db = await getFirebaseAdminDb();
    const ref = db.collection("serviceAssignments").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await ref.set(data, { merge: true });
    const updated = { ...snap.data(), ...data, id };

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update service assignment", error);
    return NextResponse.json({ error: "Failed to update service assignment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const { id } = await params;

    const db = await getFirebaseAdminDb();
    await db.collection("serviceAssignments").doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete service assignment", error);
    return NextResponse.json({ error: "Failed to delete service assignment" }, { status: 500 });
  }
}
