"use client";

type Post = {
  id: number;
  isPinned: boolean;
  isLocked: boolean;
};

async function requestJSON(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, init);
    let data: any = null;
    try {
        data = await res.json();
    } catch {
        // ignore
    }
    if (!res.ok) {
        const msg =
            (data?.error ? String(data.error) : data?.message ? String(data.message) : `Request failed: ${res.status}`) +
            (data?.received !== undefined ? ` (received: ${String(data.received)})` : "");

        throw new Error(msg);
    }
    return data;
}

export default function AdminButtons({ post }: { post: Post }) {
  async function pin() {
    try {
      await requestJSON(`/api/posts/${post.id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });
      location.reload();
    } catch (e: any) {
      alert(`置顶失败：${e.message}`);
    }
  }

  async function lock() {
    try {
      await requestJSON(`/api/posts/${post.id}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !post.isLocked }),
      });
      location.reload();
    } catch (e: any) {
      alert(`锁帖失败：${e.message}`);
    }
  }

  async function remove() {
    if (!confirm("确定删除这条帖子？")) return;
    try {
      await requestJSON(`/api/posts/${post.id}`, { method: "DELETE" });
      // 删除成功后建议回首页，不然你还停留在这篇帖子页
      location.href = "/";
    } catch (e: any) {
      alert(`删除失败：${e.message}`);
    }
  }

  return (
    <>
      <button onClick={pin}>{post.isPinned ? "取消置顶" : "置顶"}</button>
      <button onClick={lock}>{post.isLocked ? "解锁" : "锁帖"}</button>
      <button onClick={remove} style={{ color: "crimson" }}>
        删除
      </button>
    </>
  );
}
