import "server-only";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function getMe() {
  const session = await getSession();
  return session.user ?? null;
}

export async function requireAdmin() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}