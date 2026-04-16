"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error ?? "Login failed");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 520 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>登录</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          用户名或邮箱
          <input
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="abc or abc@gmail.com"
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          密码
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
          {loading ? "登录中…" : "登录"}
        </button>

        {msg && <div style={{ color: "crimson" }}>{msg}</div>}

        <div style={{ opacity: 0.75 }}>
          还没有账号？ <Link href="/register">去注册</Link>
        </div>
      </form>
    </main>
  );
}
