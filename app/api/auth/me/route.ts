import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-guards";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    return NextResponse.json({ user, authenticated: true });
  } catch (error) {
    console.error("Failed to resolve current user", error);
    return NextResponse.json({ error: "Failed to resolve current user" }, { status: 500 });
  }
}
