import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getMe();

  // ✅ 权限判断
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ 正确写法（Next.js 16）
  const { id } = await params;

  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json(
      { error: "Invalid id", received: id },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const isLocked = Boolean(body?.isLocked);

  const post = await prisma.post.update({
    where: { id: postId },
    data: { isLocked },
    select: { id: true, isLocked: true },
  });

  return NextResponse.json({ ok: true, post });
}