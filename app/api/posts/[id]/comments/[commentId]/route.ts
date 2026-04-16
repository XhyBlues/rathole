import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const me = await getMe();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, commentId } = await params;

    const postId = Number(id);
    const cId = Number(commentId);

    if (!Number.isFinite(postId) || !Number.isFinite(cId)) {
      return NextResponse.json(
        { error: "Invalid id", received: { id, commentId } },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: cId },
      include: { author: { select: { id: true } } },
    });

    if (!comment || comment.postId !== postId) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (me.role !== "ADMIN" && me.id !== comment.authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.comment.update({
      where: { id: cId },
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