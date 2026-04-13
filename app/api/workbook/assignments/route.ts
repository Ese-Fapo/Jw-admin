import { NextRequest, NextResponse } from "next/server";
import { WORKBOOK_SECTIONS, isWorkbookSection } from "@/lib/domain-types";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { nowMs, weekKeyFromInput } from "@/lib/firestore-data";
import { requireAdmin } from "@/lib/auth-guards";

function hasConfiguredDatabase() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

function parseWeekDate(value: string | null) {
  return weekKeyFromInput(value);
}

export async function GET(request: NextRequest) {
  try {
    if (!hasConfiguredDatabase()) {
      return NextResponse.json({ assignments: [], warning: "Database is not configured" });
    }

    const week = parseWeekDate(request.nextUrl.searchParams.get("week"));
    const start = parseWeekDate(request.nextUrl.searchParams.get("start"));
    const end = parseWeekDate(request.nextUrl.searchParams.get("end"));

    const db = await getFirebaseAdminDb();
    const query = week
      ? db.collection("workbookAssignments").where("weekOf", "==", week)
      : start && end
        ? db.collection("workbookAssignments").where("weekOf", ">=", start).where("weekOf", "<=", end)
        : db.collection("workbookAssignments");

    const assignments = (await query.get()).docs
      .map((doc) => doc.data())
      .map((row) => ({
        id: String(row.id),
        weekOf: String(row.weekOf),
        section: String(row.section),
        partTitle: String(row.partTitle ?? ""),
        personName: String(row.personName ?? "To be assigned"),
        assistantName: (row.assistantName as string | null | undefined) ?? null,
        position: Number(row.position ?? 0),
        notes: (row.notes as string | null | undefined) ?? null,
      }))
      .sort((a, b) => {
        if (a.weekOf < b.weekOf) return -1;
        if (a.weekOf > b.weekOf) return 1;
        const sec = WORKBOOK_SECTIONS.indexOf(a.section as (typeof WORKBOOK_SECTIONS)[number]) - WORKBOOK_SECTIONS.indexOf(b.section as (typeof WORKBOOK_SECTIONS)[number]);
        if (sec !== 0) return sec;
        return a.position - b.position;
      });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Failed to fetch workbook assignments", error);
    return NextResponse.json({ error: "Failed to fetch workbook assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const body = await request.json();

    const weekOf = parseWeekDate(body.weekOf ?? null);
    const section = String(body.section ?? "");
    const partTitle = String(body.partTitle ?? "").trim();
    const personName = String(body.personName ?? "To be assigned").trim() || "To be assigned";
    const assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    const parsedPosition = Number(body.position);
    const notes = body.notes ? String(body.notes) : null;

    if (!weekOf || !partTitle) {
      return NextResponse.json({ error: "weekOf and partTitle are required" }, { status: 400 });
    }

    if (!isWorkbookSection(section)) {
      return NextResponse.json({ error: "Invalid section value" }, { status: 400 });
    }

    let position = parsedPosition;
    if (!Number.isFinite(position)) {
      const db = await getFirebaseAdminDb();
      const rows = (await db
        .collection("workbookAssignments")
        .where("weekOf", "==", weekOf)
        .where("section", "==", section)
        .get()).docs.map((doc) => Number(doc.data().position ?? 0));
      position = (rows.length ? Math.max(...rows) : 0) + 1;
    }

    const db = await getFirebaseAdminDb();
    const docRef = db.collection("workbookAssignments").doc();
    const assignment = {
      id: docRef.id,
      weekOf,
      section,
      partTitle,
      personName,
      assistantName,
      position,
      notes,
      createdById: admin.user.id,
      createdAt: nowMs(),
      updatedAt: nowMs(),
    };
    await docRef.set(assignment);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Failed to create workbook assignment", error);
    return NextResponse.json({ error: "Failed to create workbook assignment" }, { status: 500 });
  }
}
