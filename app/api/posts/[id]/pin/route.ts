import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMe();
    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Next.js 16 正确写法
    const { id } = await params;

    const postId = Number(id);
    if (!Number.isFinite(postId)) {
      return NextResponse.json(
        { error: "Invalid id", received: id },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const isPinned = Boolean(body?.isPinned);

    const post = await prisma.post.update({
      where: { id: postId },
      data: { isPinned },
      select: { id: true, isPinned: true },
    });

    return NextResponse.json({ ok: true, post });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}