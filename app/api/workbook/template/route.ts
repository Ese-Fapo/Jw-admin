import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { nowMs, weekKeyFromInput } from "@/lib/firestore-data";
import { requireAdmin } from "@/lib/auth-guards";
import { workbookTemplateParts } from "@/lib/workbook-template";

function parseWeekDate(value: string | null) {
  return weekKeyFromInput(value);
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const body = await request.json();
    const weekOf = parseWeekDate(body.weekOf ?? null);
    const overwrite = Boolean(body.overwrite);

    if (!weekOf) {
      return NextResponse.json({ error: "Valid weekOf is required" }, { status: 400 });
    }

    const db = await getFirebaseAdminDb();
    const existingDocs = await db.collection("workbookAssignments").where("weekOf", "==", weekOf).get();
    const existingCount = existingDocs.size;
    if (existingCount > 0 && !overwrite) {
      return NextResponse.json(
        {
          error: "Assignments already exist for this week. Use overwrite=true to replace.",
          existingCount,
        },
        { status: 409 }
      );
    }

    if (overwrite && existingCount > 0) {
      const batch = db.batch();
      existingDocs.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    const timestamp = nowMs();
    const batch = db.batch();
    workbookTemplateParts.forEach((part) => {
      const ref = db.collection("workbookAssignments").doc();
      batch.set(ref, {
        id: ref.id,
        weekOf,
        section: part.section,
        partTitle: part.partTitle,
        personName: "To be assigned",
        assistantName: null,
        position: part.position,
        notes: null,
        createdById: admin.user.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });
    await batch.commit();

    return NextResponse.json({
      ok: true,
      createdCount: workbookTemplateParts.length,
      weekOf,
    });
  } catch (error) {
    console.error("Failed to generate workbook template", error);
    return NextResponse.json({ error: "Failed to generate workbook template" }, { status: 500 });
  }
}
