// app/new/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import MarkdownEditor from "@/app/components/MarkdownEditor";
import { ensureWeeklyPromptRolledOver } from "@/lib/weekly";
import NewPostSectionFields from "./NewPostSectionFields";

export default async function NewPostPage() {
  await ensureWeeklyPromptRolledOver();

  const activeWeekly = await prisma.weeklyPrompt.findFirst({
    where: { isActive: true },
  });

  async function createPost(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session.user) redirect("/login");

    const rawTitle = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const section = String(formData.get("section") ?? "HOME");

    if (!content) return;

    if (section === "WEEKLY") {
      await ensureWeeklyPromptRolledOver();

      const activeWeekly = await prisma.weeklyPrompt.findFirst({
        where: { isActive: true },
      });

      if (!activeWeekly) return;

      await prisma.post.create({
        data: {
          title: activeWeekly.prompt,
          content,
          authorId: session.user.id,
          section: "WEEKLY",
          weeklyId: activeWeekly.id,
        },
      });
    } else {
      if (!rawTitle) return;

      await prisma.post.create({
        data: {
          title: rawTitle,
          content,
          authorId: session.user.id,
          section: "HOME",
        },
      });
    }

    redirect("/");
  }

  const pageStyle: React.CSSProperties = {
    padding: 28,
    fontFamily: "system-ui",
    maxWidth: 920,
    margin: "0 auto",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
  };

  const labelStyle: React.CSSProperties = {
    display: "grid",
    gap: 8,
    fontSize: 14,
    opacity: 0.9,
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    outline: "none",
  };

  const helperStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.65,
    lineHeight: 1.6,
  };

  return (
    <main style={pageStyle}>
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          font-size: 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
          will-change: transform;
          user-select: none;
        }
        .btn:hover {
          transform: scale(1.04);
        }

        .btnPrimary {
          background: #111;
          color: #fff;
          border: 1px solid #111;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        }
        .btnPrimary:hover {
          box-shadow: 0 8px 22px rgba(0,0,0,0.28);
        }

        .btnSecondary {
          background: rgba(255,255,255,0.9);
          color: #111;
          border: 1px solid rgba(0,0,0,0.18);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          text-decoration: none;
        }
        .btnSecondary:hover {
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }

        .backLink {
          text-decoration: none;
          opacity: 0.85;
        }
        .backLink:hover {
          opacity: 1;
        }
      `}</style>

      <div style={{ marginBottom: 14 }}>
        <Link href="/" className="backLink">
          ← 返回首页
        </Link>
      </div>

      <div style={cardStyle}>
        <h1 style={{ fontSize: 26, marginBottom: 10 }}>发布帖子</h1>

        <form action={createPost} style={{ display: "grid", gap: 14 }}>
          <label style={labelStyle}>
            标题

            <NewPostSectionFields
              activeWeeklyPrompt={activeWeekly?.prompt ?? ""}
              inputStyle={inputStyle}
              helperStyle={helperStyle}
            />
          </label>

          <label style={labelStyle}>
            内容
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              <MarkdownEditor name="content" placeholder="在这里输入正文…" rows={12} />
            </div>
            <div style={helperStyle}>
              支持 Markdown：**加粗**、*斜体*、- 列表、```代码```
            </div>
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button type="submit" className="btn btnPrimary">
              发布
            </button>

            <Link href="/" className="btn btnSecondary">
              取消
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}