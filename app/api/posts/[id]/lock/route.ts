import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const me = await getMe();

  // ✅ 权限判断
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


  const body = await req.json().catch(() => ({}));
  const isLocked = Boolean(body?.isLocked);

  const post = await prisma.post.update({
    where: { id: postId },
    data: { isLocked },
    select: { id: true, isLocked: true },
  });

  return NextResponse.json({ ok: true, post });
}
