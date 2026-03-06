"use client";

import { useEffect, useState } from "react";
import ScoreGauge from "@/components/ScoreGauge";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website: string;
  category: string;
  overall_score: number;
  policy_count: number;
}

const CATEGORIES = [
  "All",
  "Technology",
  "Social Media",
  "Entertainment",
  "E-Commerce",
  "Finance",
  "Productivity",
  "Messaging",
  "Professional",
  "Transportation",
  "Travel",
  "Education",
  "Healthcare",
];

export default function RankingsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"worst" | "best">("worst");

  useEffect(() => {
    async function fetchRankings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "All") params.set("category", category);
        params.set("sort", sortOrder);
        const res = await fetch(`/api/rankings?${params}`);
        const data = await res.json();
        setCompanies(data);
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [category, sortOrder]);

  function getScoreColor(score: number) {
    if (score <= 3) return "var(--accent-green)";
    if (score <= 6) return "var(--accent-yellow)";
    if (score < 10) return "var(--accent-red)";
    return "var(--accent-darkred)";
  }

  function getRiskLabel(score: number) {
    if (score <= 3) return { label: "Low", className: "badge badge-low" };
    if (score <= 6) return { label: "Medium", className: "badge badge-medium" };
    return { label: "High", className: "badge badge-high" };
  }

  return (
    <div className="container" style={{ padding: "3rem 2rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
          Company Rankings
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "600px" }}>
          Every indexed company ranked by policy fairness. Lower scores mean
          better treatment of users. Companies cannot pay to improve their
          score.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "100px",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                border: "1px solid",
                borderColor:
                  category === cat
                    ? "var(--accent-green)"
                    : "var(--border-color)",
                background:
                  category === cat ? "var(--accent-green-dim)" : "transparent",
                color:
                  category === cat
                    ? "var(--accent-green)"
                    : "var(--text-secondary)",
                transition: "all var(--transition-fast)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button
            className={`tab ${sortOrder === "worst" ? "active" : ""}`}
            onClick={() => setSortOrder("worst")}
          >
            Worst First
          </button>
          <button
            className={`tab ${sortOrder === "best" ? "active" : ""}`}
            onClick={() => setSortOrder("best")}
          >
            Best First
          </button>
        </div>
      </div>

      {/* Rankings Table */}
      {loading ? (
        <div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                width: "100%",
                height: "72px",
                marginBottom: "0.5rem",
                borderRadius: "var(--radius-md)",
              }}
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-tertiary)" }}>
            No companies found in this category.
          </p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3rem 1fr 120px 120px 100px",
              padding: "0.75rem 1.25rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>#</span>
            <span>Company</span>
            <span>Category</span>
            <span style={{ textAlign: "center" }}>Score</span>
            <span style={{ textAlign: "center" }}>Risk</span>
          </div>

          {companies.map((company, idx) => {
            const risk = getRiskLabel(company.overall_score);
            return (
              <a
                key={company.slug}
                href={`/${company.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "3rem 1fr 120px 120px 100px",
                  alignItems: "center",
                  padding: "0.9rem 1.25rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all var(--transition-fast)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {company.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        width={24}
                        height={24}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {company.name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                      {company.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {company.policy_count || 0} policies
                    </div>
                  </div>
                </div>
                <span className="category-tag">{company.category}</span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <ScoreGauge
                    score={company.overall_score}
                    size={50}
                    showLabel={false}
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <span
                    className={risk.className}
                    style={{ fontSize: "0.68rem" }}
                  >
                    {risk.label}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
