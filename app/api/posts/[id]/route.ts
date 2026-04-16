import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function DELETE(
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
        { error: "Invalid id", received: id },
        { status: 400 }
      );
    }

    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}