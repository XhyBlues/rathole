import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function PATCH(req: Request) {
  const me = await getMe();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const bio = typeof body?.bio === "string" ? body.bio : "";

  // 简单校验：最多 500 字（可改）
  if (bio.length > 500) {
    return NextResponse.json({ error: "Bio too long" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: { bio },
    select: { id: true, username: true, bio: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}
