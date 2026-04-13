import { NextRequest, NextResponse } from "next/server";
import { WorkbookSection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

function parseWeekDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: NextRequest) {
  try {
    const week = parseWeekDate(request.nextUrl.searchParams.get("week"));

    const assignments = await prisma.workbookAssignment.findMany({
      where: week ? { weekOf: week } : undefined,
      orderBy: [{ weekOf: "asc" }, { section: "asc" }, { position: "asc" }],
      select: {
        id: true,
        weekOf: true,
        section: true,
        partTitle: true,
        personName: true,
        assistantName: true,
        position: true,
        notes: true,
      },
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
    const section = String(body.section ?? "") as WorkbookSection;
    const partTitle = String(body.partTitle ?? "").trim();
    const personName = String(body.personName ?? "").trim();
    const assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    const position = Number(body.position ?? 0);
    const notes = body.notes ? String(body.notes) : null;

    if (!weekOf || !partTitle || !personName || !Number.isFinite(position)) {
      return NextResponse.json({ error: "weekOf, partTitle, personName and position are required" }, { status: 400 });
    }

    if (!Object.values(WorkbookSection).includes(section)) {
      return NextResponse.json({ error: "Invalid section value" }, { status: 400 });
    }

    const assignment = await prisma.workbookAssignment.create({
      data: {
        weekOf,
        section,
        partTitle,
        personName,
        assistantName,
        position,
        notes,
        createdById: admin.user.id,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Failed to create workbook assignment", error);
    return NextResponse.json({ error: "Failed to create workbook assignment" }, { status: 500 });
  }
}
