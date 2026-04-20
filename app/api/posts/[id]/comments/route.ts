import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);

    if (!Number.isFinite(postId)) {
      return NextResponse.json(
        { error: "Invalid post id", received: id },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const topLevel = comments.filter((c) => c.parentId == null);
    const replies = comments.filter((c) => c.parentId != null);

    const commentTree = topLevel.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parentId === c.id),
    }));

    return NextResponse.json({ ok: true, comments: commentTree });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMe();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = Number(id);

    if (!Number.isFinite(postId)) {
      return NextResponse.json(
        { error: "Invalid post id", received: id },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const content = body?.content?.trim();
    const parentId =
      body?.parentId == null ? null : Number(body.parentId);

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (parentId != null && !Number.isFinite(parentId)) {
      return NextResponse.json(
        { error: "Invalid parent id", received: body?.parentId },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isLocked: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: "Post is locked" },
        { status: 403 }
      );
    }

    if (parentId != null) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true },
      });

      if (!parent || parent.postId !== postId) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: me.id,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, comment });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}