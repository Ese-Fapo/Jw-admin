import { NextRequest, NextResponse } from "next/server";
import { isServiceAssignmentCategory, SERVICE_ASSIGNMENT_CATEGORIES } from "@/lib/domain-types";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { nowMs, weekKeyFromInput } from "@/lib/firestore-data";
import { requireAdmin } from "@/lib/auth-guards";

function parseWeekDate(value: string | null) {
  return weekKeyFromInput(value);
}

export async function GET(request: NextRequest) {
  try {
    const week = parseWeekDate(request.nextUrl.searchParams.get("week"));

    const db = await getFirebaseAdminDb();
    const query = week
      ? db.collection("serviceAssignments").where("weekOf", "==", week)
      : db.collection("serviceAssignments");

    const assignments = (await query.get()).docs
      .map((doc) => doc.data())
      .map((row) => ({
        id: String(row.id),
        weekOf: String(row.weekOf),
        category: String(row.category),
        title: String(row.title ?? ""),
        assigneeName: String(row.assigneeName ?? "To be assigned"),
        assistantName: (row.assistantName as string | null | undefined) ?? null,
        dayLabel: (row.dayLabel as string | null | undefined) ?? null,
        timeLabel: (row.timeLabel as string | null | undefined) ?? null,
        notes: (row.notes as string | null | undefined) ?? null,
        position: Number(row.position ?? 0),
      }))
      .sort((a, b) => {
        const cat = SERVICE_ASSIGNMENT_CATEGORIES.indexOf(a.category as (typeof SERVICE_ASSIGNMENT_CATEGORIES)[number]) - SERVICE_ASSIGNMENT_CATEGORIES.indexOf(b.category as (typeof SERVICE_ASSIGNMENT_CATEGORIES)[number]);
        if (cat !== 0) return cat;
        return a.position - b.position;
      });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Failed to fetch service assignments", error);
    return NextResponse.json({ error: "Failed to fetch service assignments" }, { status: 500 });
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
    const category = String(body.category ?? "");
    const title = String(body.title ?? "").trim();
    const assigneeName = String(body.assigneeName ?? "").trim();
    const assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    const dayLabel = body.dayLabel ? String(body.dayLabel).trim() : null;
    const timeLabel = body.timeLabel ? String(body.timeLabel).trim() : null;
    const notes = body.notes ? String(body.notes) : null;
    const position = Number(body.position ?? 0);

    if (!weekOf || !title || !assigneeName || !Number.isFinite(position)) {
      return NextResponse.json({ error: "weekOf, title, assigneeName and position are required" }, { status: 400 });
    }

    if (!isServiceAssignmentCategory(category)) {
      return NextResponse.json({ error: "Invalid category value" }, { status: 400 });
    }

    const db = await getFirebaseAdminDb();
    const ref = db.collection("serviceAssignments").doc();
    const assignment = {
      id: ref.id,
      weekOf,
      category,
      title,
      assigneeName,
      assistantName,
      dayLabel,
      timeLabel,
      notes,
      position,
      createdById: admin.user.id,
      createdAt: nowMs(),
      updatedAt: nowMs(),
    };
    await ref.set(assignment);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Failed to create service assignment", error);
    return NextResponse.json({ error: "Failed to create service assignment" }, { status: 500 });
  }
}
