"use client";

import Link from "next/link";
import ScoreGauge from "./ScoreGauge";

interface CompanyCardProps {
  name: string;
  slug: string;
  category: string;
  overall_score: number;
  policy_count: number;
  logo_url?: string;
}

export default function CompanyCard({
  name,
  slug,
  category,
  overall_score,
  policy_count,
  logo_url,
}: CompanyCardProps) {
  return (
    <Link href={`/${slug}`} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
          }}
        >
          {logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo_url}
              alt={name}
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  `<span style="font-size:1.5rem">${name[0]}</span>`;
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "1.5rem",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {name[0]}
            </span>
          )}
        </div>
        <div>
          <h4
            style={{
              fontSize: "1rem",
              marginBottom: "0.25rem",
              color: "var(--text-primary)",
            }}
          >
            {name}
          </h4>
          <span className="category-tag">{category}</span>
        </div>
        <ScoreGauge score={overall_score} size={80} showLabel={false} />
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {policy_count} {Number(policy_count) === 1 ? "policy" : "policies"}{" "}
          indexed
        </p>
      </div>
    </Link>
  );
}
