import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/lib/auth";
import AdminButtons from "@/app/components/AdminButtons";
import { marked } from "marked";
import VoteButtons from "@/app/components/VoteButtons";
import Comments from "@/app/components/Comments";




export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

const post = await prisma.post.findUnique({
  where: { id: postId },
  include: {
    author: {
      select: {
        id: true,
        username: true,
      },
    },
  },
});

if (!post || post.deletedAt) notFound();


  const me = await getMe();

  const [up, down, myVoteRow] = await Promise.all([
  prisma.vote.count({ where: { postId, value: 1 } }),
  prisma.vote.count({ where: { postId, value: -1 } }),
  me
    ? prisma.vote.findUnique({
        where: { userId_postId: { userId: me.id, postId } },
        select: { value: true },
      })
    : Promise.resolve(null),
]);

const myVote = myVoteRow?.value ?? 0;


  return (

     
        <main style={{ padding: 32, fontFamily: "system-ui", maxWidth: 820 }}>
            <div style={{ marginBottom: 16 }}>
                <Link href="/">← 返回首页</Link>
            </div>

            <h1 style={{ fontSize: 28, marginBottom: 8 }}>
                {post.isPinned && "📌 "}
                {post.title}
                {post.isLocked && (
                    <span style={{ marginLeft: 10, fontSize: 16, opacity: 0.7 }}>
                        🔒 已锁定
                    </span>
                )}
            </h1>

          {me?.role === "ADMIN" && (
              <div style={{ marginBottom: 12 }}>
                  <AdminButtons
                      post={{
                          id: post.id,
                          isPinned: post.isPinned,
                          isLocked: post.isLocked,
                      }}
                  />

                </div>
            )}

            <div style={{ opacity: 0.6, marginBottom: 18 }}>
  <span>
  作者：
  {post.author ? (
    <Link
      href={`/u/${post.author.username}`}
      style={{ textDecoration: "underline" }}
    >
      {post.author.username}
    </Link>
  ) : (
    "未知"
  )}
</span>

  <span style={{ marginLeft: 12 }}>
    {new Date(post.createdAt).toLocaleString()}
  </span>
</div>

<div style={{ marginBottom: 16 }}>
  <VoteButtons
    postId={post.id}
    initialUp={up}
    initialDown={down}
    initialMyVote={myVote}
  />
</div>


            <article
  style={{ lineHeight: 1.9 }}
  dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }}
/>

    <Comments postId={postId} me={me} />



        </main>
    );

}


