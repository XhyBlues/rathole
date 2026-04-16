import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/lib/auth";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      bio: true,
      email: true,
      posts: {
        where: { deletedAt: null },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          createdAt: true,
          isPinned: true,
          isLocked: true,
        },
      },
    },
  });

  if (!user) notFound();

  const me = await getMe();
  const isSelf = me?.id === user.id;

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 820 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/">← 返回首页</Link>
      </div>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        {user.username}
        <span style={{ marginLeft: 10, fontSize: 14, opacity: 0.7 }}>
          {user.role}
        </span>
      </h1>

      {/* 编辑 profile */}
      {isSelf && (
        <div style={{ marginBottom: 12 }}>
          <Link href="/profile" style={{ textDecoration: "underline" }}>
            编辑 profile
          </Link>
        </div>
      )}

      {/* ⭐ ADMIN 专属按钮 */}
      {isSelf && me?.role === "ADMIN" && (
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/admin/weekly"
            style={{
              display: "inline-block",
              background: "black",
              color: "white",
              padding: "8px 14px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            进入 Weekly Prompt 管理
          </Link>
        </div>
      )}

      <div style={{ opacity: 0.6, marginBottom: 16 }}>
        注册时间：{new Date(user.createdAt).toLocaleString()}
      </div>

      {user.bio && (
        <div style={{ marginBottom: 18, lineHeight: 1.8 }}>
          {user.bio}
        </div>
      )}

      {isSelf && (
        <div style={{ marginBottom: 18, opacity: 0.75 }}>
          邮箱（仅自己可见）：{user.email}
        </div>
      )}

      <h2 style={{ fontSize: 18, marginBottom: 10 }}>帖子</h2>

      {user.posts.length === 0 ? (
        <div style={{ opacity: 0.6 }}>还没有发过帖子</div>
      ) : (
        <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
          {user.posts.map((p) => (
            <li key={p.id}>
              <Link href={`/post/${p.id}`}>
                {p.isPinned && "📌 "}
                {p.title}
                {p.isLocked && (
                  <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                    🔒
                  </span>
                )}
              </Link>
              <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.6 }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}