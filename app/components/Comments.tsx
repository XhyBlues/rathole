"use client";

import { useEffect, useMemo, useState } from "react";

type Me =
  | { id: number; role: "USER" | "ADMIN"; username?: string }
  | null;

type CommentItem = {
  id: number;
  content: string;
  createdAt: string;
  deletedAt?: string | null;
  parentId?: number | null;
  author: { id: number; username: string };
};

type CommentTree = CommentItem & { replies: CommentItem[] };

export default function Comments({ postId, me }: { postId: number; me: Me }) {
  const [comments, setComments] = useState<CommentTree[]>([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const canWrite = useMemo(() => !!me, [me]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("load comments failed:", data);
        setComments([]);
      } else {
        setComments((data?.comments ?? []) as CommentTree[]);
      }
    } catch (e) {
      console.error("load comments failed:", e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function submitTop() {
    if (!canWrite) {
      alert("请先登录再评论");
      return;
    }

    const text = content.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error ?? "Failed to comment");
        return;
      }

      setContent("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReply(parentId: number) {
    if (!canWrite) {
      alert("请先登录再回复");
      return;
    }

    const text = replyContent.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, parentId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error ?? "Failed to reply");
        return;
      }

      setReplyTo(null);
      setReplyContent("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: number) {
    if (!me) {
      alert("请先登录");
      return;
    }

    if (!confirm("确定删除这条评论吗？")) return;

    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error ?? "Failed to delete");
      return;
    }

    await load();
  }

  function canDelete(item: CommentItem) {
    if (!me) return false;
    if (item.deletedAt) return false;
    return me.role === "ADMIN" || me.id === item.author.id;
  }

  function renderMeta(item: CommentItem, right?: React.ReactNode) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 13,
          opacity: 0.75,
          marginBottom: 6,
        }}
      >
        <div>
          <b style={{ opacity: 1 }}>{item.author.username}</b> ·{" "}
          {new Date(item.createdAt).toLocaleString()}
        </div>
        {right}
      </div>
    );
  }

  function renderContent(item: CommentItem) {
    if (item.deletedAt) {
      return (
        <div style={{ lineHeight: 1.7, opacity: 0.6, fontStyle: "italic" }}>
          该评论已删除
        </div>
      );
    }
    return (
      <div style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {item.content}
      </div>
    );
  }

  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>评论</h2>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={canWrite ? "写下你的评论..." : "登录后才能评论"}
          rows={3}
          disabled={!canWrite}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            fontFamily: "system-ui",
            resize: "vertical",
            background: canWrite ? "#fff" : "rgba(0,0,0,0.03)",
          }}
        />
        <button
          onClick={submitTop}
          disabled={submitting || !canWrite}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            background: submitting || !canWrite ? "#eee" : "#111",
            color: submitting || !canWrite ? "#666" : "#fff",
            cursor: submitting || !canWrite ? "not-allowed" : "pointer",
          }}
        >
          发布
        </button>
      </div>

      {loading ? (
        <div style={{ opacity: 0.7 }}>加载中...</div>
      ) : comments.length === 0 ? (
        <div style={{ opacity: 0.7 }}>还没有评论，来当第一个！</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#fff",
              }}
            >
              {renderMeta(
                c,
                canDelete(c) ? (
                  <button
                    onClick={() => deleteComment(c.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                      opacity: 0.8,
                      textDecoration: "underline",
                    }}
                  >
                    删除
                  </button>
                ) : null
              )}

              {renderContent(c)}

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => {
                    if (c.deletedAt) return;
                    setReplyTo((prev) => (prev === c.id ? null : c.id));
                    setReplyContent("");
                  }}
                  disabled={!!c.deletedAt}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: c.deletedAt ? "not-allowed" : "pointer",
                    padding: 0,
                    opacity: c.deletedAt ? 0.35 : 0.75,
                    textDecoration: "underline",
                  }}
                >
                  回复
                </button>
              </div>

              {replyTo === c.id && !c.deletedAt && (
                <div style={{ marginTop: 10, paddingLeft: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={
                        canWrite ? `回复 @${c.author.username}...` : "登录后才能回复"
                      }
                      rows={2}
                      disabled={!canWrite}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.15)",
                        fontFamily: "system-ui",
                        resize: "vertical",
                        background: canWrite ? "#fff" : "rgba(0,0,0,0.03)",
                      }}
                    />
                    <button
                      onClick={() => submitReply(c.id)}
                      disabled={submitting || !canWrite}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.15)",
                        background: submitting || !canWrite ? "#eee" : "#111",
                        color: submitting || !canWrite ? "#666" : "#fff",
                        cursor: submitting || !canWrite ? "not-allowed" : "pointer",
                      }}
                    >
                      回复
                    </button>
                  </div>
                </div>
              )}

              {c.replies.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingLeft: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {c.replies.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.10)",
                        background: "rgba(0,0,0,0.02)",
                      }}
                    >
                      {renderMeta(
                        r,
                        canDelete(r) ? (
                          <button
                            onClick={() => deleteComment(r.id)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              padding: 0,
                              opacity: 0.8,
                              textDecoration: "underline",
                            }}
                          >
                            删除
                          </button>
                        ) : null
                      )}

                      {renderContent(r)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}