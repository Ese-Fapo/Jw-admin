import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guards";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const method = String(body.method ?? "unknown").slice(0, 40);

    await prisma.adminSignInHistory.create({
      data: {
        adminUserId: user.id,
        adminEmail: user.email || "unknown",
        method,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to log admin sign in", error);
    return NextResponse.json({ error: "Failed to log admin sign in" }, { status: 500 });
  }
}
