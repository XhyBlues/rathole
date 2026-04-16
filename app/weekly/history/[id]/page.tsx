import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function WeeklyHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idString } = await params;
  const id = Number(idString);

  const weekly = await prisma.weeklyPrompt.findUnique({
    where: { id },
    include: {
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
    },
  });

  if (!weekly) {
    return <main style={{ padding: 32 }}>未找到这一期 weekly prompt。</main>;
  }


  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    color: "#18181b",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 16px",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid rgba(24,24,27,0.10)",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    marginBottom: 12,
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Link
          href="/weekly/history"
          style={{ textDecoration: "none", color: "rgba(24,24,27,0.65)" }}
        >
          ← 返回历史列表
        </Link>

        <div style={{ marginTop: 20, marginBottom: 24 }}>
          <div
            style={{
              fontSize: 14,
              color: "rgba(24,24,27,0.65)",
              marginBottom: 8,
            }}
          >
            {new Date(weekly.startAt).toLocaleDateString("zh-CN")} -{" "}
            {new Date(weekly.endAt).toLocaleDateString("zh-CN")}
          </div>

          <h1 style={{ fontSize: 32, margin: 0, fontWeight: 800 }}>
            {weekly.prompt?.trim() || "（当周未设置 prompt）"}
          </h1>
        </div>

        <div>
          {weekly.posts.length ? (
            weekly.posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  ...cardStyle,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {post.title}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "rgba(24,24,27,0.65)" }}
                  >
                    {new Date(post.createdAt).toLocaleString("zh-CN")}
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>{post.content}</div>

                <div style={{ fontSize: 13, color: "rgba(24,24,27,0.65)" }}>
                  by {post.author.username}
                </div>
              </Link>
            ))
          ) : (
            <div style={{ color: "rgba(24,24,27,0.65)" }}>这一期没有帖子。</div>
          )}
        </div>
      </div>
    </main>
  );
}