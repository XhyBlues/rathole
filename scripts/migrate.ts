// @ts-ignore
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sqlite = new Database("prisma/dev-backup.db", { readonly: true });

/* ---------- 工具函数 ---------- */

function toDate(v: any): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

function toNullableDate(v: any): Date | null {
  const d = toDate(v);
  return d ?? null;
}

function toBool(v: any, def = false): boolean {
  if (v === null || v === undefined) return def;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return String(v).toLowerCase() === "true";
}

function normalizeRole(u: any): "ADMIN" | "USER" {
  if (u.role === "ADMIN" || u.role === "USER") return u.role;
  return u.isAdmin ? "ADMIN" : "USER";
}

function normalizeSection(p: any): "HOME" | "WEEKLY" {
  if (p.section === "HOME" || p.section === "WEEKLY") return p.section;
  return p.weeklyId ? "WEEKLY" : "HOME";
}

/* ---------- 主流程 ---------- */

async function main() {
  console.log("Start migration...");

  // ===== USERS =====
  const users = sqlite.prepare(`SELECT * FROM "User"`).all();
  console.log("Users:", users.length);

  for (const u of users as any[]) {
    await prisma.user.create({
      data: {
        id: u.id,
        username: u.username,
        email: u.email ?? `${u.username}@placeholder.local`,
        passwordHash: u.passwordHash ?? u.password ?? "",
        role: normalizeRole(u),
        bio: u.bio ?? null,
        createdAt: toDate(u.createdAt),
      },
    });
  }

  // ===== WEEKLY PROMPT（关键修复）=====
  const weeklyTableExists = sqlite
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='WeeklyPrompt'`
    )
    .get();

  if (weeklyTableExists) {
    const weeklys = sqlite.prepare(`SELECT * FROM "WeeklyPrompt"`).all();
    console.log("WeeklyPrompt:", weeklys.length);

    for (const w of weeklys as any[]) {
      await prisma.weeklyPrompt.create({
        data: {
          id: w.id,
          prompt: w.prompt ?? "",

          // 如果旧库没有 weekKey，自动生成
          weekKey: w.weekKey ?? `week-${w.id}`,

          startAt: toDate(w.startAt) ?? new Date(),
          endAt: toDate(w.endAt) ?? new Date(),

          isActive: toBool(w.isActive, true),
          createdAt: toDate(w.createdAt),
        },
      });
    }
  } else {
    console.log("No WeeklyPrompt table found");
  }

  // ===== POSTS =====
  const posts = sqlite.prepare(`SELECT * FROM "Post"`).all();
  console.log("Posts:", posts.length);

  for (const p of posts as any[]) {
    await prisma.post.create({
      data: {
        id: p.id,
        title: p.title,
        content: p.content,
        authorId: p.authorId,
        createdAt: toDate(p.createdAt),

        isPinned: toBool(p.isPinned, false),
        isLocked: toBool(p.isLocked, false),
        deletedAt: toNullableDate(p.deletedAt),

        section: normalizeSection(p),

        // ⚠️ 关键：只有存在才写
        weeklyId: p.weeklyId ?? null,
      },
    });
  }

  // ===== COMMENTS =====
  const comments = sqlite.prepare(`SELECT * FROM "Comment"`).all();
  console.log("Comments:", comments.length);

  for (const c of comments as any[]) {
    await prisma.comment.create({
      data: {
        id: c.id,
        content: c.content,
        authorId: c.authorId,
        postId: c.postId,
        createdAt: toDate(c.createdAt),
        deletedAt: toNullableDate(c.deletedAt),
      },
    });
  }

  console.log("Migration done.");
}

/* ---------- 执行 ---------- */

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  });