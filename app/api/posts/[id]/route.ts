import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function DELETE(
    req: Request, 
    { params }: { params: any })

 {
  try {
    const me = await getMe();
    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

      const p: any = params;
      const resolvedParams = typeof p?.then === "function" ? await p : p;

      const postId = Number(resolvedParams?.id);
      if (!Number.isFinite(postId)) {
          return NextResponse.json(
              { error: "Invalid id", received: resolvedParams?.id },
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
