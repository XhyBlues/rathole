import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: any } // ✅ 跟你项目保持一致：不要强类型死
) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ 复制你 app/api/posts/[id]/route.ts 的 “resolvedParams” 逻辑
  const p: any = params;
  const resolvedParams = typeof p?.then === "function" ? await p : p;

  const postId = Number(resolvedParams?.id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json(
      { error: "Invalid postId", received: resolvedParams?.id },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const value = body?.value;

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "value must be 1 or -1" }, { status: 400 });
  }

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId: me.id, postId } },
    select: { value: true },
  });

  if (!existing) {
    await prisma.vote.create({ data: { userId: me.id, postId, value } });
  } else if (existing.value === value) {
    await prisma.vote.delete({
      where: { userId_postId: { userId: me.id, postId } },
    });
  } else {
    await prisma.vote.update({
      where: { userId_postId: { userId: me.id, postId } },
      data: { value },
    });
  }

  const [up, down, myVote] = await Promise.all([
    prisma.vote.count({ where: { postId, value: 1 } }),
    prisma.vote.count({ where: { postId, value: -1 } }),
    prisma.vote.findUnique({
      where: { userId_postId: { userId: me.id, postId } },
      select: { value: true },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    up,
    down,
    myVote: myVote?.value ?? 0,
  });
}
