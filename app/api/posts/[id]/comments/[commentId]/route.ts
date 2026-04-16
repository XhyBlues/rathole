import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const me = await getMe();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ 从 URL 解析参数（绕开 params bug）
    const url = new URL(req.url);
    const parts = url.pathname.split("/");

    // /api/posts/1/comments/2
    const postId = Number(parts[3]);
    const commentId = Number(parts[5]);

    if (!Number.isFinite(postId) || !Number.isFinite(commentId)) {
      return NextResponse.json(
        {
          error: "Invalid id",
          received: { postId, commentId },
        },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: { id: true } } },
    });

    if (!comment || comment.postId !== postId) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (me.role !== "ADMIN" && me.id !== comment.authorId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true, comment: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
