import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureWeeklyPromptRolledOver } from "@/lib/weekly";

export default async function WeeklyPage() {
  await ensureWeeklyPromptRolledOver();
  const activeWeekly = await prisma.weeklyPrompt.findFirst({
    where: { isActive: true },
    include: {
      posts: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: true,
        },
      },
    },
    orderBy: {
      startAt: "desc",
    },
  });

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

  const heroCardStyle: React.CSSProperties = {
    border: "1px solid rgba(24,24,27,0.10)",
    borderRadius: 16,
    padding: 24,
    background: "#fff",
    marginBottom: 24,
  };

  const topRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 999,
    background: "#18181b",
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
  };

  const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const cardStyle: React.CSSProperties = {
    display: "block",
    border: "1px solid rgba(24,24,27,0.10)",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    textDecoration: "none",
    color: "inherit",
  };

  const emptyStyle: React.CSSProperties = {
    border: "1px dashed rgba(24,24,27,0.18)",
    borderRadius: 16,
    padding: 28,
    background: "#fff",
    textAlign: "center",
    color: "rgba(24,24,27,0.65)",
  };

  const metaStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(24,24,27,0.65)",
    whiteSpace: "nowrap",
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={heroCardStyle}>
          <div style={{ fontSize: 13, color: "rgba(24,24,27,0.65)", marginBottom: 8 }}>
            weekly prompt
          </div>

          <h1 style={{ fontSize: 34, margin: 0, fontWeight: 800, lineHeight: 1.2 }}>
            {activeWeekly?.prompt?.trim() ? activeWeekly.prompt : "本周 prompt 暂未设置"}
          </h1>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: 14,
              color: "rgba(24,24,27,0.65)",
              lineHeight: 1.7,
            }}
          >
            这里展示本周主题下的所有帖子。
          </p>
        </div>

        <div style={topRowStyle}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>本周帖子</h2>

          <Link href="/new" style={buttonStyle}>
            发帖
          </Link>
        </div>

        <div style={listStyle}>
          {activeWeekly?.posts.length ? (
            activeWeekly.posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.35 }}>
                    {post.title}
                  </div>

                  <span style={metaStyle}>
                    {new Date(post.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "#18181b",
                    marginBottom: 10,
                  }}
                >
                  {post.content}
                </div>

                <div style={{ fontSize: 13, color: "rgba(24,24,27,0.65)" }}>
                  by {post.author.username}
                </div>
              </Link>
            ))
          ) : (
            <div style={emptyStyle}>本周还没有帖子。</div>
          )}
        </div>
      </div>
    </main>
  );
}