import { NextRequest, NextResponse } from "next/server";
import { isWorkbookSection } from "@/lib/domain-types";
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
      section?: string;
      partTitle?: string;
      personName?: string;
      assistantName?: string | null;
      position?: number;
      notes?: string | null;
      updatedAt?: number;
    } = {};

    if (body.weekOf !== undefined) {
      const weekOf = parseWeekDate(String(body.weekOf));
      if (!weekOf) return NextResponse.json({ error: "Invalid weekOf" }, { status: 400 });
      data.weekOf = weekOf;
    }

    if (body.section !== undefined) {
      const section = String(body.section);
      if (!isWorkbookSection(section)) {
        return NextResponse.json({ error: "Invalid section value" }, { status: 400 });
      }
      data.section = section;
    }

    if (body.partTitle !== undefined) data.partTitle = String(body.partTitle).trim();
    if (body.personName !== undefined) data.personName = String(body.personName).trim();
    if (body.assistantName !== undefined) data.assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    if (body.position !== undefined) data.position = Number(body.position);
    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null;

    data.updatedAt = nowMs();

    const db = await getFirebaseAdminDb();
    const ref = db.collection("workbookAssignments").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await ref.set(data, { merge: true });
    const updated = { ...snap.data(), ...data, id };

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update workbook assignment", error);
    return NextResponse.json({ error: "Failed to update workbook assignment" }, { status: 500 });
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
    await db.collection("workbookAssignments").doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete workbook assignment", error);
    return NextResponse.json({ error: "Failed to delete workbook assignment" }, { status: 500 });
  }
}
