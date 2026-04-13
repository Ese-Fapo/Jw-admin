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
      section?: WorkbookSection;
      partTitle?: string;
      personName?: string;
      assistantName?: string | null;
      position?: number;
      notes?: string | null;
    } = {};

    if (body.weekOf !== undefined) {
      const weekOf = parseWeekDate(String(body.weekOf));
      if (!weekOf) return NextResponse.json({ error: "Invalid weekOf" }, { status: 400 });
      data.weekOf = weekOf;
    }

    if (body.section !== undefined) {
      const section = String(body.section) as WorkbookSection;
      if (!Object.values(WorkbookSection).includes(section)) {
        return NextResponse.json({ error: "Invalid section value" }, { status: 400 });
      }
      data.section = section;
    }

    if (body.partTitle !== undefined) data.partTitle = String(body.partTitle).trim();
    if (body.personName !== undefined) data.personName = String(body.personName).trim();
    if (body.assistantName !== undefined) data.assistantName = body.assistantName ? String(body.assistantName).trim() : null;
    if (body.position !== undefined) data.position = Number(body.position);
    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null;

    const updated = await prisma.workbookAssignment.update({
      where: { id },
      data,
    });

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

    await prisma.workbookAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete workbook assignment", error);
    return NextResponse.json({ error: "Failed to delete workbook assignment" }, { status: 500 });
  }
}
