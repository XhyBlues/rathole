import { prisma } from "@/lib/prisma";
import { getMe } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/app/components/ProfileForm";

export default async function ProfilePage() {
  const me = await getMe();
  if (!me) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    select: { username: true, bio: true },
  });

  return (
    <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 820 }}>
      <div
  style={{
    marginBottom: 16,
    display: "flex",
    gap: 16,
    alignItems: "center",
  }}
>
  <Link href="/">← 返回首页</Link>

  <Link
    href={`/u/${me.username}`}
    style={{ opacity: 0.7 }}
  >
    ← 返回我的主页
  </Link>
</div>


      <h1 style={{ fontSize: 28, marginBottom: 12 }}>我的 Profile</h1>
      <div style={{ opacity: 0.65, marginBottom: 18 }}>
        当前账号：{user?.username}
      </div>

      <ProfileForm initialBio={user?.bio ?? ""} />
    </main>
  );
}
