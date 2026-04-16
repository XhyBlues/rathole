import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function WeeklyHistoryPage() {
  const history = await prisma.weeklyPrompt.findMany({
    where: { isActive: false },
    orderBy: { startAt: "desc" },
    include: {
      _count: {
        select: { posts: true },
      },
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

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: 32, marginTop: 0, marginBottom: 24, fontWeight: 800 }}>
          历史 weekly prompt
        </h1>

        <div style={listStyle}>
          {history.length ? (
            history.map((item) => (
              <Link key={item.id} href={`/weekly/history/${item.id}`} style={cardStyle}>
                <div style={{ fontSize: 14, color: "rgba(24,24,27,0.65)", marginBottom: 8 }}>
                  {new Date(item.startAt).toLocaleDateString("zh-CN")} -{" "}
                  {new Date(item.endAt).toLocaleDateString("zh-CN")}
                </div>

                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                  {item.prompt?.trim() || "（当周未设置 prompt）"}
                </div>

                <div style={{ fontSize: 13, color: "rgba(24,24,27,0.65)" }}>
                  {item._count.posts} 篇帖子
                </div>
              </Link>
            ))
          ) : (
            <div style={{ color: "rgba(24,24,27,0.65)" }}>还没有历史 weekly prompt。</div>
          )}
        </div>
      </div>
    </main>
  );
}