import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const me = await getMe();

    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const postId = Number(id);

    if (!Number.isFinite(postId)) {
      return NextResponse.json(
        { error: "Invalid post id", received: id },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        isLocked: !post.isLocked,
      },
    });

    return NextResponse.json({
      ok: true,
      post: {
        id: updated.id,
        isLocked: updated.isLocked,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}