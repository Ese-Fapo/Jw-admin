import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const history = await prisma.adminSignInHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        adminUserId: true,
        adminEmail: true,
        method: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to fetch admin history", error);
    return NextResponse.json({ error: "Failed to fetch admin history" }, { status: 500 });
  }
}
