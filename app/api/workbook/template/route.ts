import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { workbookTemplateParts } from "@/lib/workbook-template";

function parseWeekDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
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

    const existingCount = await prisma.workbookAssignment.count({ where: { weekOf } });
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
      await prisma.workbookAssignment.deleteMany({ where: { weekOf } });
    }

    const created = await prisma.workbookAssignment.createMany({
      data: workbookTemplateParts.map((part) => ({
        weekOf,
        section: part.section,
        partTitle: part.partTitle,
        personName: "To be assigned",
        assistantName: null,
        position: part.position,
        notes: null,
        createdById: admin.user.id,
      })),
    });

    return NextResponse.json({
      ok: true,
      createdCount: created.count,
      weekOf,
    });
  } catch (error) {
    console.error("Failed to generate workbook template", error);
    return NextResponse.json({ error: "Failed to generate workbook template" }, { status: 500 });
  }
}
