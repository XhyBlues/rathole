import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

async function resolveParams(params: any) {
  const p: any = params;
  return typeof p?.then === "function" ? await p : p;
}

// ✅ GET: 拉取评论树（顶层 + replies）
export async function GET(req: Request, { params }: { params: any }) {
  const rp = await resolveParams(params);
  const postId = Number(rp?.id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  // 顶层评论
  const topLevel = await prisma.comment.findMany({
    where: { postId, deletedAt: null, parentId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
    },
  });

  const ids = topLevel.map((c) => c.id);
  const replies = ids.length
    ? await prisma.comment.findMany({
        where: { postId, deletedAt: null, parentId: { in: ids } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          parentId: true,
          author: { select: { id: true, username: true } },
        },
      })
    : [];

  const replyMap = new Map<number, any[]>();
  for (const r of replies) {
    const pid = r.parentId!;
    if (!replyMap.has(pid)) replyMap.set(pid, []);
    replyMap.get(pid)!.push(r);
  }

  const comments = topLevel.map((c) => ({
    ...c,
    replies: replyMap.get(c.id) ?? [],
  }));

  return NextResponse.json({ ok: true, comments });
}

// ✅ POST: 发评论或回复
export async function POST(req: Request, { params }: { params: any }) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rp = await resolveParams(params);
  const postId = Number(rp?.id);
  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const content = (body?.content ?? "").trim();
  const parentIdRaw = body?.parentId;
  const parentId =
    parentIdRaw === null || parentIdRaw === undefined ? null : Number(parentIdRaw);

  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "content too long (max 500)" }, { status: 400 });
  }
  if (parentId !== null && !Number.isFinite(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  // 如果是回复：校验 parent 是否存在、是否同一帖子、且 parent 必须是顶层（只做一层）
  if (parentId !== null) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true, parentId: true, deletedAt: true },
    });

    if (!parent || parent.deletedAt) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
    if (parent.postId !== postId) {
      return NextResponse.json({ error: "Parent not in this post" }, { status: 400 });
    }
    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Only one-level replies allowed" },
        { status: 400 }
      );
    }
  }

  const created = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: me.id,
      parentId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      parentId: true,
      author: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json({ ok: true, comment: created });
}
