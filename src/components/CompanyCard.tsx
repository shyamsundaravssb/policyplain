"use client";

import Link from "next/link";
import ScoreGauge from "./ScoreGauge";
import CompanyLogo from "./CompanyLogo";

interface CompanyCardProps {
  name: string;
  slug: string;
  category: string;
  overall_score: number;
  policy_count: number;
  logo_url?: string;
  website?: string;
}

export default function CompanyCard({
  name,
  slug,
  category,
  overall_score,
  policy_count,
  logo_url,
  website,
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
        <CompanyLogo
          name={name}
          website={website}
          logo_url={logo_url}
          size={56}
        />
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
