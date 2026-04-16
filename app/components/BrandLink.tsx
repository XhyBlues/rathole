"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function BrandLink() {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        color: "inherit",
        fontWeight: 700,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Image
              src="/rathole.png"
              alt="Rathole"
              width={40}
              height={40}
              style={{ borderRadius: 8 }}   // 圆角更现代
      />

      <span
        style={{
        opacity: hover ? 0.65 : 1,
        transition: "opacity 0.15s ease",
        letterSpacing: "0.2px",
        }}
>
        Rathole
        </span>
    </Link>
  );
}
