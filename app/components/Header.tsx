// app/components/Header.tsx
import { getSession } from "@/lib/session";
import LogoutButton from "./LogoutButton";
import BrandLink from "./BrandLink";
import Link from "next/link";


export default async function Header() {
  const session = await getSession();
  const user = session.user ?? null;

  return (
    <header
      style={{
            padding: "14px 18px",          // 原来 16 太“高”，这里更精致
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(250,250,250,0.6)", // 轻微底色
      }}
    >
      {/* 左：品牌（带hover + 图片） */}
      <BrandLink />

      {/* 右：状态 + 退出（顶到最右） */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ opacity: 0.65, fontSize: 13 }}>
  {user ? (
    <Link
      href={`/u/${user.username}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      Hi, {user.username}
    </Link>
  ) : (
    "Not logged in"
  )}
</span>


        {user && <LogoutButton />}
      </div>
    </header>
  );
}
