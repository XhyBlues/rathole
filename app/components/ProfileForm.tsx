"use client";

import { useState } from "react";

export default function ProfileForm({ initialBio }: { initialBio: string }) {
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      setMsg("已保存 ✅");
    } catch (e: any) {
      setMsg(`保存失败：${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>个人简介（Bio）</div>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="几行字"
        rows={6}
        style={{
          width: "100%",
          maxWidth: 640,
          padding: 12,
          lineHeight: 1.6,
        }}
      />
      <div style={{ marginTop: 8, opacity: 0.6 }}>
        {bio.length}/500
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={save} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </button>
        {msg && <span style={{ opacity: 0.8 }}>{msg}</span>}
      </div>
    </div>
  );
}
