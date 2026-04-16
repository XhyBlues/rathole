"use client";

import { useState } from "react";

export default function VoteButtons({
  postId,
  initialUp,
  initialDown,
  initialMyVote = 0,
}: {
  postId: number;
  initialUp: number;
  initialDown: number;
  initialMyVote?: number; // 1 / -1 / 0
}) {
  const [up, setUp] = useState(initialUp);
  const [down, setDown] = useState(initialDown);
  const [myVote, setMyVote] = useState(initialMyVote);
  const [loading, setLoading] = useState(false);

  async function send(value: 1 | -1) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // 未登录：你可以改成 push 到 /login
        alert(data?.error ?? "Request failed");
        return;
      }

      setUp(data.up);
      setDown(data.down);
      setMyVote(data.myVote);
    } finally {
      setLoading(false);
    }
  }

  const base: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.15)",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "transform 120ms ease, opacity 120ms ease",
    opacity: loading ? 0.6 : 1,
    userSelect: "none",
  };

  const activeUp = myVote === 1;
  const activeDown = myVote === -1;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <button
        disabled={loading}
        onClick={() => send(1)}
        style={{
          ...base,
          background: activeUp ? "#111" : "#fff",
          color: activeUp ? "#fff" : "#111",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        👍 {up}
      </button>

      <button
        disabled={loading}
        onClick={() => send(-1)}
        style={{
          ...base,
          background: activeDown ? "#111" : "#f3f3f3",
          color: activeDown ? "#fff" : "#111",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        👎 {down}
      </button>
    </div>
  );
}
