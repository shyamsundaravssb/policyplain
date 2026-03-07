"use client";

import CompanyLogo from "./CompanyLogo";

interface Company {
  name: string;
  slug: string;
  category: string;
  overall_score: number;
  logo_url: string;
  website: string;
}

function getScoreColor(score: number) {
  if (score <= 3) return "var(--accent-green)";
  if (score <= 6) return "var(--accent-yellow)";
  return "var(--accent-red)";
}

export default function RecentlyUpdatedList({
  companies,
}: {
  companies: Company[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {companies.map((company) => (
        <a
          key={company.slug}
          href={`/${company.slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            color: "inherit",
            transition: "all var(--transition-fast)",
          }}
        >
          <CompanyLogo
            name={company.name}
            website={company.website}
            logo_url={company.logo_url}
            size={40}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{company.name}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
              {company.category}
            </div>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: getScoreColor(company.overall_score),
            }}
          >
            {company.overall_score.toFixed(1)}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            →
          </span>
        </a>
      ))}
    </div>
  );
}
