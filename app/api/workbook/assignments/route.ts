import { NextRequest, NextResponse } from "next/server";
import { WorkbookSection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

function hasConfiguredDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl) return false;
  return !["USER", "PASSWORD", "HOST", "DATABASE"].some((token) =>
    databaseUrl.includes(token)
  );
}

function parseWeekDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: NextRequest) {
  try {
    if (!hasConfiguredDatabase()) {
      return NextResponse.json({ assignments: [], warning: "Database is not configured" });
    }

    const week = parseWeekDate(request.nextUrl.searchParams.get("week"));
    const start = parseWeekDate(request.nextUrl.searchParams.get("start"));
    const end = parseWeekDate(request.nextUrl.searchParams.get("end"));

    const where = week
      ? { weekOf: week }
      : start && end
        ? { weekOf: { gte: start, lte: end } }
        : undefined;

    const assignments = await prisma.workbookAssignment.findMany({
      where,
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
    const personName = String(body.personName ?? "To be assigned").trim() || "To be assigned";
    const assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    const parsedPosition = Number(body.position);
    const notes = body.notes ? String(body.notes) : null;

    if (!weekOf || !partTitle) {
      return NextResponse.json({ error: "weekOf and partTitle are required" }, { status: 400 });
    }

    if (!Object.values(WorkbookSection).includes(section)) {
      return NextResponse.json({ error: "Invalid section value" }, { status: 400 });
    }

    let position = parsedPosition;
    if (!Number.isFinite(position)) {
      const latestInSection = await prisma.workbookAssignment.findFirst({
        where: { weekOf, section },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = (latestInSection?.position ?? 0) + 1;
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
