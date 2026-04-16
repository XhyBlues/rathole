"use client";

import { useState } from "react";

type Props = {
  activeWeeklyPrompt: string;
  inputStyle: React.CSSProperties;
  helperStyle: React.CSSProperties;
};

export default function NewPostSectionFields({
  activeWeeklyPrompt,
  inputStyle,
  helperStyle,
}: Props) {
  const [section, setSection] = useState<"HOME" | "WEEKLY">("HOME");

  const weeklyTitleBoxStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(0,0,0,0.03)",
    color: "rgba(0,0,0,0.8)",
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 13, marginBottom: 6 }}>发布到</div>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="section"
              value="HOME"
              checked={section === "HOME"}
              onChange={() => setSection("HOME")}
            />
            首页
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="section"
              value="WEEKLY"
              checked={section === "WEEKLY"}
              onChange={() => setSection("WEEKLY")}
            />
            weekly prompt
          </label>
        </div>
      </div>

      {section === "HOME" ? (
  <>
    <input
      key="home-title-input"
      name="title"
      placeholder="比如：操场逃跑路线统计"
      style={inputStyle}
      maxLength={120}
      defaultValue=""
    />
    <div style={helperStyle}>最多 120 字</div>
  </>
) : (
  <>
    <input
      key="weekly-title-hidden"
      type="hidden"
      name="title"
      value=""
      readOnly
    />
    <div style={{ fontSize: 13, marginTop: 6 }}>
      weekly prompt 发帖将自动使用本周 prompt 作为标题
    </div>
    <div style={weeklyTitleBoxStyle}>
      {activeWeeklyPrompt || "当前没有可用的 weekly prompt"}
    </div>
  </>
)}
    </div>
  );
}