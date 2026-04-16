// app/api/auth/logout/route.ts
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy(); // 关键：销毁 session
  return Response.json({ ok: true });
}

// 可选：方便你用浏览器直接访问 /api/auth/logout 也能退出
export async function GET() {
  const session = await getSession();
  session.destroy();
  return Response.redirect(new URL("/", "http://localhost:3000"));
}
