import { NextRequest, NextResponse } from "next/server";
import { ensureWeeklyPromptRolledOver } from "@/lib/weekly";
import { prisma } from "@/lib/prisma";



export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET 未设置" },
      { status: 500 }
    );
  }

  if (authHeader !== expected) {
  console.log("FAIL", authHeader, expected);
}   

  await ensureWeeklyPromptRolledOver();

  const active = await prisma.weeklyPrompt.findFirst({
    where: { isActive: true },
    orderBy: { startAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    active,
  });
}