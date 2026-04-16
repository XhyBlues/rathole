"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    router.replace("/");  // 强制回到首页（不保留历史）
    router.refresh();     // 让 Header 重新读 session
  }

 return (
  <button
    onClick={logout}
    style={{
      marginLeft: 12,
      padding: "6px 10px",
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.12)",
      background: "#fff",
      fontSize: 13,
      cursor: "pointer",
      lineHeight: 1,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(0,0,0,0.04)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#fff";
    }}
  >
    退出
  </button>
);

}
