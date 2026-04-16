// @ts-ignore
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sqlite = new Database("prisma/dev-backup.db", { readonly: true });

const SKIP_TABLES = new Set([
  "User",
  "Post",
  "Comment",
  "WeeklyPrompt",
  "sqlite_sequence",
]);

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const d = value < 1e12 ? new Date(value * 1000) : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const s = String(value).trim();
  if (!s) return null;

  if (/^\d+$/.test(s)) {
    const n = Number(s);
    const d = n < 1e12 ? new Date(n * 1000) : new Date(n);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function maybeConvertValue(column: string, value: unknown) {
  const lower = column.toLowerCase();

  const looksLikeDate =
    lower.endsWith("at") ||
    lower.includes("date") ||
    lower.includes("time") ||
    lower === "expires" ||
    lower === "expiry";

  if (looksLikeDate) {
    return toDate(value);
  }

  return value;
}

function getSqliteTables(): string[] {
  const rows = sqlite
    .prepare(
      `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
      ORDER BY name
      `
    )
    .all() as Array<{ name: string }>;

  return rows.map((r) => r.name);
}

function getSqliteColumns(table: string): string[] {
  const rows = sqlite.prepare(`PRAGMA table_info(${quoteIdent(table)})`).all() as Array<{
    name: string;
  }>;
  return rows.map((r) => r.name);
}

async function getPgColumns(table: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
    ORDER BY ordinal_position
  `;
  return rows.map((r) => r.column_name);
}

async function migrateTable(table: string) {
  const sqliteColumns = getSqliteColumns(table);
  const pgColumns = await getPgColumns(table);

  if (pgColumns.length === 0) {
    console.log(`Skip ${table}: not found in Postgres`);
    return;
  }

  const sharedColumns = sqliteColumns.filter((c) => pgColumns.includes(c));

  if (sharedColumns.length === 0) {
    console.log(`Skip ${table}: no shared columns`);
    return;
  }

  const rows = sqlite
    .prepare(`SELECT * FROM ${quoteIdent(table)}`)
    .all() as Record<string, unknown>[];

  console.log(`${table}: ${rows.length} rows`);

  for (const row of rows) {
    const cols = sharedColumns;
    const values = cols.map((c) => maybeConvertValue(c, row[c]));
    const colSql = cols.map(quoteIdent).join(", ");
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const hasId = cols.includes("id");
    const onConflict = hasId ? ` ON CONFLICT ("id") DO NOTHING` : "";

    const sql = `INSERT INTO ${quoteIdent(table)} (${colSql}) VALUES (${placeholders})${onConflict}`;

    await prisma.$executeRawUnsafe(sql, ...values);
  }
}

async function main() {
  console.log("Start remaining migration...");

  const tables = getSqliteTables().filter((t) => !SKIP_TABLES.has(t));
  console.log("Candidate tables:", tables);

  for (const table of tables) {
    await migrateTable(table);
  }

  console.log("Remaining migration done.");
}

main()
  .catch((err) => {
    console.error("Remaining migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  });