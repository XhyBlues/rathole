import { prisma } from "@/lib/prisma";
// NOTE: 你这里 getMe 没用到，先注释避免 eslint 提示
// import { getMe } from "@/lib/auth";

import { ensureWeeklyPromptRolledOver } from "@/lib/weekly"
import Link from "next/link"



export default async function Home() {

  await ensureWeeklyPromptRolledOver()

  const activeWeekly = await prisma.weeklyPrompt.findFirst({
  where: { isActive: true },
  orderBy: { startAt: "desc" },
  })


  const posts = await prisma.post.findMany({
  where: {
    deletedAt: null,
    section: "HOME", // ⭐ 新加这一行
  },
  orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  take: 20,
  });

  // =========================
  // THEME：你只需要改这一块
  // =========================
  const theme = {
    layout: {
      maxWidth: 1100, // 页面内容宽度：想更宽改大（1200/1400），更窄改小（900）
      pagePaddingX: 16, // 左右边距
      heroPaddingY: 40, // 顶部 Hero 上下留白（决定“高级感”）
      bodyPaddingY: 32, // 主体内容上下留白
      gap: 32, // 左右两栏间距
      radius: 16, // 圆角（8=硬朗，16=现代，24=更软）
    },
    colors: {
      bg: "#ffffff",
      text: "#18181b",
      mutedText: "rgba(24,24,27,0.65)",
      border: "rgba(24,24,27,0.10)",
      softBg: "rgba(24,24,27,0.03)",
      // 置顶的“待遇”
      pinnedBg: "rgba(245, 158, 11, 0.12)", // amber-ish
      pinnedBorder: "rgba(245, 158, 11, 0.35)",
      // 主按钮（发帖）
      buttonBg: "#18181b",
      buttonText: "#ffffff",
      buttonHoverBg: "#27272a",
    },
    type: {
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      h1: 30, // 标题字号
      subtitle: 14,
      sectionTitle: 14,
      postTitle: 16,
      meta: 12,
    },
  };

  // =========================
  // 帖子分区：置顶 / 普通
  // =========================
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const normalPosts = posts.filter((p) => !p.isPinned);

  // =========================
  // Inline style helpers
  // =========================
  const wrap = (style: React.CSSProperties) => style;

  const containerStyle = wrap({
    minHeight: "100vh",
    background: theme.colors.bg,
    color: theme.colors.text,
    fontFamily: theme.type.fontFamily,
  });

  const centerStyle = wrap({
    maxWidth: theme.layout.maxWidth,
    margin: "0 auto",
    paddingLeft: theme.layout.pagePaddingX,
    paddingRight: theme.layout.pagePaddingX,
  });

  const heroStyle = wrap({
    borderBottom: `1px solid ${theme.colors.border}`,
    background: theme.colors.softBg,
  });

  const heroInnerStyle = wrap({
    ...centerStyle,
    paddingTop: theme.layout.heroPaddingY,
    paddingBottom: theme.layout.heroPaddingY,
  });

  const mainStyle = wrap({
    ...centerStyle,
    paddingTop: theme.layout.bodyPaddingY,
    paddingBottom: theme.layout.bodyPaddingY,
    display: "grid",
    gridTemplateColumns: "2fr 1fr", // 左：帖子 右：侧栏（想取消侧栏：改成 "1fr" 并删除 aside）
    gap: theme.layout.gap,
  });

  const buttonRowStyle = wrap({
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 20,
  });

  const linkPillStyle = wrap({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    border: `1px solid ${theme.colors.border}`,
    textDecoration: "none",
    color: theme.colors.text,
    fontSize: 13,
    background: theme.colors.bg,
  });

  const primaryPillStyle = wrap({
    ...linkPillStyle,
    border: "none",
    background: theme.colors.buttonBg,
    color: theme.colors.buttonText,
  });

  const sectionTitleStyle = wrap({
    fontSize: theme.type.sectionTitle,
    fontWeight: 700,
    margin: "0 0 12px 0",
    color: theme.colors.mutedText,
    letterSpacing: "0.2px",
  });

  const cardStyleBase = wrap({
    display: "block",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.layout.radius,
    padding: 16,
    textDecoration: "none",
    color: "inherit",
    background: theme.colors.bg,
  });

  const pinnedCardStyle = wrap({
    ...cardStyleBase,
    border: `1px solid ${theme.colors.pinnedBorder}`,
    background: theme.colors.pinnedBg,
  });

  const cardTitleStyle = wrap({
    fontSize: theme.type.postTitle,
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.35,
  });

  const metaStyle = wrap({
    fontSize: theme.type.meta,
    color: theme.colors.mutedText,
    marginLeft: 10,
    whiteSpace: "nowrap",
  });

  const listStyle = wrap({
    display: "flex",
    flexDirection: "column",
    gap: 12, // 卡片间距（更疏=16，更紧=8）
  });

  const sidebarCardStyle = wrap({
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.layout.radius,
    padding: 16,
    background: theme.colors.bg,
  });

  const sidebarTitleStyle = wrap({
    margin: 0,
    fontWeight: 700,
    fontSize: 14,
  });

  const sidebarTextStyle = wrap({
    marginTop: 8,
    marginBottom: 0,
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 1.6,
  });

  // NOTE: 纯 inline 做 hover 需要 JS（onMouseEnter/onMouseLeave）。
  // 这里先保持极简；如果你想要 hover 高级感，我也能给你加一版“无 Tailwind 的 hover”。

  return (
    <div style={containerStyle}>
      {/* HERO：定调 + 留白 */}
      <header style={heroStyle}>
        <div style={heroInnerStyle}>
          <h1 style={{ fontSize: theme.type.h1, margin: 0, fontWeight: 800 }}>
            犬儒鼠窝 · Rathole
          </h1>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: theme.type.subtitle,
              color: theme.colors.mutedText,
              maxWidth: 640,
              lineHeight: 1.7,
            }}
          >
            轻盈且迅速钻地
          </p>

          {/* 顶部动作区：登录/注册/发帖 */}
          <div style={buttonRowStyle}>
            <a href="/login" style={linkPillStyle}>
              登录
            </a>
            <a href="/register" style={linkPillStyle}>
              注册
            </a>
            <a href="/new" style={primaryPillStyle}>
              发帖
            </a>
            <a href="/weekly/history" style={linkPillStyle}>
            历史 weekly prompt
            </a>
          </div>
        </div>
      </header>

      <div style={{ padding: "24px 16px", maxWidth: 1100, margin: "0 auto" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 16,
      padding: 20,
      background: "#fff",
    }}
  >
    <div>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
        weekly prompt
      </div>

      
      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
        {activeWeekly?.prompt?.trim()
          ? activeWeekly.prompt
          : "本周 prompt 暂未设置"}
      </div>
      

      
    </div>

    

    <Link
      href="/weekly"
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        background: "#000",
        color: "#fff",
        textDecoration: "none",
        fontSize: 14,
      }}
    >
      进入
    </Link>
  </div>
</div>

      {/* 主体：左（帖子）右（侧栏） */}
      <main style={mainStyle}>
        {/* 左侧帖子 */}
        <section>
          {posts.length === 0 ? (
            <div style={sidebarCardStyle}>
              <p style={{ margin: 0, color: theme.colors.mutedText }}>
                还没有帖子。去 <span style={{ fontWeight: 700 }}>/new</span> 发第一帖 🐭
              </p>
            </div>
          ) : (
            <>
              {/* 置顶分区：让置顶“有待遇”，不是只靠📌 */}
              {pinnedPosts.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={sectionTitleStyle}>📌 置顶</div>

                  <div style={listStyle}>
                    {pinnedPosts.map((p) => (
                      <a key={p.id} href={`/post/${p.id}`} style={pinnedCardStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <p style={cardTitleStyle}>
                            <span style={{ marginRight: 6 }}>📌</span>
                            {p.title}
                          </p>

                          <span style={metaStyle}>
                            {new Date(p.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 普通分区 */}
              <div>
                <div style={sectionTitleStyle}>最新帖子</div>

                <div style={listStyle}>
                  {normalPosts.map((p) => (
                    <a key={p.id} href={`/post/${p.id}`} style={cardStyleBase}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <p style={cardTitleStyle}>{p.title}</p>
                        <span style={metaStyle}>
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* 右侧侧栏（桌面端用；如果你觉得多余可以删掉整个 aside） */}
        <aside>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={sidebarCardStyle}>
              <h3 style={sidebarTitleStyle}>关于 Rathole</h3>
              <p style={sidebarTextStyle}>
                admin是叠<br />
                第二行内容
              </p>
            </div>

            <div style={sidebarCardStyle}>
              <h3 style={sidebarTitleStyle}>写点什么？</h3>
              <a
                href="/new"
                style={{
                  display: "inline-flex",
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: theme.colors.buttonBg,
                  color: theme.colors.buttonText,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                发帖
              </a>
            </div>

            <div style={sidebarCardStyle}>
              <h3 style={sidebarTitleStyle}>进入Rathole</h3>
              <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18, color: theme.colors.mutedText, fontSize: 13, lineHeight: 1.8 }}>
                <li>/* 这里写内容 /*</li>
                <li>.第二行</li>
                <li>老鼠养殖日记</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
