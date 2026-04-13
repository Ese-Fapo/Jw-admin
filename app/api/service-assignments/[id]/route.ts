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
      weekOf?: Date;
      category?: ServiceAssignmentCategory;
      title?: string;
      assigneeName?: string;
      assistantName?: string | null;
      dayLabel?: string | null;
      timeLabel?: string | null;
      notes?: string | null;
      position?: number;
    } = {};

    if (body.weekOf !== undefined) {
      const weekOf = parseWeekDate(String(body.weekOf));
      if (!weekOf) return NextResponse.json({ error: "Invalid weekOf" }, { status: 400 });
      data.weekOf = weekOf;
    }

    if (body.category !== undefined) {
      const category = String(body.category) as ServiceAssignmentCategory;
      if (!Object.values(ServiceAssignmentCategory).includes(category)) {
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

    const updated = await prisma.serviceAssignment.update({
      where: { id },
      data,
    });

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

    await prisma.serviceAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete service assignment", error);
    return NextResponse.json({ error: "Failed to delete service assignment" }, { status: 500 });
  }
}
