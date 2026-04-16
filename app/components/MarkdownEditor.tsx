"use client";

import { useMemo, useRef, useState } from "react";
import { marked } from "marked";

type Mode = "edit" | "preview" | "split";

export default function MarkdownEditor({
  name,
  placeholder,
  rows = 10,
  maxLength = 10000,
}: {
  name: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<Mode>("split");
  const [content, setContent] = useState("");

  const html = useMemo(() => {
    return marked.parse(content || "");
  }, [content]);

  function applyChange(next: string, restoreSel?: { start: number; end: number }) {
    if (next.length > maxLength) return;
    setContent(next);

    // 让光标/选区在 setState 后恢复
    if (restoreSel) {
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(restoreSel.start, restoreSel.end);
      });
    }
  }

  function wrap(left: string, right: string) {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);

    const next = before + left + selected + right + after;

    const newStart = start + left.length;
    const newEnd = newStart + selected.length;

    applyChange(next, { start: newStart, end: newEnd });
  }

  function insertPrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);

    const delta = prefix.length;
    applyChange(next, { start: start + delta, end: end + delta });
  }

  function insertText(text: string) {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const next = content.slice(0, start) + text + content.slice(end);
    const pos = start + text.length;

    applyChange(next, { start: pos, end: pos });
  }

  const Preview = (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: 8,
        padding: 12,
        lineHeight: 1.9,
        minHeight: 240,
        background: "rgba(250,250,250,0.6)",
        overflow: "auto",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  const Editor = (
    <div style={{ display: "grid", gap: 6 }}>
      <textarea
        ref={ref}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
  const isMod = e.metaKey || e.ctrlKey;
  if (!isMod) return;

  const key = e.key.toLowerCase();

  if (key === "b") {
    e.preventDefault();
    wrap("**", "**");
  } else if (key === "i") {
    e.preventDefault();
    wrap("*", "*");
  } else if (key === "1") {
    e.preventDefault();
    insertPrefix("# ");
  } else if (key === "2") {
    e.preventDefault();
    insertPrefix("## ");
  } else if (key === "k") {
    e.preventDefault();
    insertText("[text](url)");
  }
}}

        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          resize: "vertical",
          lineHeight: 1.6,
        }}
      />
      <div style={{ opacity: 0.6, fontSize: 12 }}>
        {content.length}/{maxLength}
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* 工具栏 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setMode("edit")} disabled={mode === "edit"}>
          编辑
        </button>
        <button type="button" onClick={() => setMode("preview")} disabled={mode === "preview"}>
          预览
        </button>
        <button type="button" onClick={() => setMode("split")} disabled={mode === "split"}>
          分屏
        </button>

        <span style={{ opacity: 0.35 }}>|</span>

        <button type="button" onClick={() => wrap("**", "**")}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => wrap("*", "*")}>
          <i>I</i>
        </button>
        <button type="button" onClick={() => insertPrefix("# ")}>
          H1
        </button>
        <button type="button" onClick={() => insertPrefix("## ")}>
          H2
        </button>
        <button type="button" onClick={() => insertText("\n---\n")}>
          分隔线
        </button>

        <span style={{ opacity: 0.6, fontSize: 12, marginLeft: 6 }}>
          Markdown：**加粗**、*斜体*、# 标题、- 列表、```代码块
        </span>
      </div>

      {/* 编辑区 */}
      {mode === "edit" && Editor}

      {mode === "preview" && Preview}

      {mode === "split" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>编辑</div>
            {Editor}
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>预览</div>
            {Preview}
          </div>
        </div>
      )}
    </div>
  );
}
