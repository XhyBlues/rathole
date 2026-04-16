"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error ?? "Register failed");
      return;
    }

    router.push("/login");
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 520 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>注册</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          用户名
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="比如：blues"
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          邮箱
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          密码（至少 6 位）
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 10, fontSize: 16, cursor: "pointer" }}
        >
          {loading ? "注册中…" : "注册"}
        </button>

        {msg && <div style={{ color: "crimson" }}>{msg}</div>}

        <div style={{ opacity: 0.75 }}>
          已有账号？ <Link href="/login">去登录</Link>
        </div>
      </form>
    </main>
  );
}
