import { NextRequest, NextResponse } from "next/server";
import { ServiceAssignmentCategory } from "@prisma/client";
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

    const assignments = await prisma.serviceAssignment.findMany({
      where: week ? { weekOf: week } : undefined,
      orderBy: [{ category: "asc" }, { position: "asc" }],
      select: {
        id: true,
        weekOf: true,
        category: true,
        title: true,
        assigneeName: true,
        assistantName: true,
        dayLabel: true,
        timeLabel: true,
        notes: true,
        position: true,
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Failed to fetch service assignments", error);
    return NextResponse.json({ error: "Failed to fetch service assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const body = await request.json();

    const weekOf = parseWeekDate(body.weekOf ?? null);
    const category = String(body.category ?? "") as ServiceAssignmentCategory;
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

    if (!Object.values(ServiceAssignmentCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid category value" }, { status: 400 });
    }

    const assignment = await prisma.serviceAssignment.create({
      data: {
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
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Failed to create service assignment", error);
    return NextResponse.json({ error: "Failed to create service assignment" }, { status: 500 });
  }
}
