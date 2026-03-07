"use client";

import { useState } from "react";

interface CompanyLogoProps {
  name: string;
  website?: string;
  logo_url?: string;
  size?: number;
}

function getDomain(website?: string, logo_url?: string): string | null {
  try {
    if (website) {
      return new URL(website).hostname.replace("www.", "");
    }
    if (logo_url) {
      // Extract domain from clearbit URL or similar
      const match = logo_url.match(/clearbit\.com\/(.+)/);
      if (match) return match[1];
      return new URL(logo_url).hostname;
    }
  } catch {
    /* ignore */
  }
  return null;
}

// Color palette for fallback initials
const COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#9b59b6",
  "#f39c12",
  "#1abc9c",
  "#e91e63",
  "#00bcd4",
  "#ff9800",
  "#8bc34a",
  "#673ab7",
  "#009688",
  "#ff5722",
  "#607d8b",
  "#795548",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function CompanyLogo({
  name,
  website,
  logo_url,
  size = 56,
}: CompanyLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [img2Failed, setImg2Failed] = useState(false);

  const domain = getDomain(website, logo_url);
  const iconSize = Math.round(size * 0.7);
  const fontSize = size * 0.38;
  const bgColor = getColorForName(name);
  const initial = name.charAt(0).toUpperCase();

  // Try Google Favicon first, then original logo_url, then fallback to initial
  const googleFaviconUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: size > 48 ? "var(--radius-lg)" : "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    border: "1px solid var(--border-color)",
  };

  // Show styled initial fallback
  if ((!googleFaviconUrl && !logo_url) || (imgFailed && img2Failed)) {
    return (
      <div
        style={{
          ...containerStyle,
          background: `linear-gradient(135deg, ${bgColor}22, ${bgColor}44)`,
        }}
      >
        <span
          style={{
            fontSize,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: bgColor,
            lineHeight: 1,
          }}
        >
          {initial}
        </span>
      </div>
    );
  }

  // Try Google favicon first
  if (googleFaviconUrl && !imgFailed) {
    return (
      <div style={{ ...containerStyle, background: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={googleFaviconUrl}
          alt={name}
          width={iconSize}
          height={iconSize}
          style={{ objectFit: "contain" }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Try original logo_url as fallback
  if (logo_url && !img2Failed) {
    return (
      <div style={{ ...containerStyle, background: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo_url}
          alt={name}
          width={iconSize}
          height={iconSize}
          style={{ objectFit: "contain" }}
          onError={() => setImg2Failed(true)}
        />
      </div>
    );
  }

  // Final fallback
  return (
    <div
      style={{
        ...containerStyle,
        background: `linear-gradient(135deg, ${bgColor}22, ${bgColor}44)`,
      }}
    >
      <span
        style={{
          fontSize,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          color: bgColor,
          lineHeight: 1,
        }}
      >
        {initial}
      </span>
    </div>
  );
}
