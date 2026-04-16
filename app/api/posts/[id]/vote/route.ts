import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

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
    const value = Number(body?.value);

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: me.id,
          postId,
        },
      },
    });

    if (!existing) {
      await prisma.vote.create({
        data: {
          userId: me.id,
          postId,
          value,
        },
      });
    } else if (existing.value === value) {
      await prisma.vote.delete({
        where: {
          userId_postId: {
            userId: me.id,
            postId,
          },
        },
      });
    } else {
      await prisma.vote.update({
        where: {
          userId_postId: {
            userId: me.id,
            postId,
          },
        },
        data: { value },
      });
    }

    const votes = await prisma.vote.findMany({
      where: { postId },
      select: { value: true },
    });

    const score = votes.reduce((sum, v) => sum + v.value, 0);
    const myVote =
      existing?.value === value ? 0 : value;

    return NextResponse.json({
      ok: true,
      postId,
      score,
      myVote,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}