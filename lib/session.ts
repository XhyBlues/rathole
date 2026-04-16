// lib/session.ts
import { cookies } from "next/headers";
import { getIronSession, type IronSessionData } from "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    user?: { id: number; username: string; role: "USER" | "ADMIN" };
  }
}

const sessionOptions = {
  cookieName: "rathole_session",
  password: process.env.SESSION_PASSWORD as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();        // ✅ 关键：await
  return getIronSession<IronSessionData>(cookieStore as any, sessionOptions);
}
