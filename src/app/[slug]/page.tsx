"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ScoreGauge from "@/components/ScoreGauge";
import RiskBadge from "@/components/RiskBadge";
import ScoreBar from "@/components/ScoreBar";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import Link from "next/link";

interface Policy {
  id: string;
  policy_type: string;
  slug: string;
  source_url: string;
  overall_summary: string;
  risk_level: "low" | "medium" | "high";
  risk_summary: string;
  score_data_privacy: number;
  score_user_rights: number;
  score_billing: number;
  score_legal_exposure: number;
  note_data_privacy: string;
  note_user_rights: string;
  note_billing: string;
  note_legal_exposure: string;
  data_collected: string[];
  data_sharing: string[];
  your_rights: string[];
  what_you_give_up: string[];
  billing: string[];
  risk_flags: string[];
  analyzed_at: string;
  version_number: number;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website: string;
  category: string;
  overall_score: number;
  policies: Policy[];
}

export default function CompanyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch(`/api/companies/${slug}`);
        if (!res.ok) throw new Error("Company not found");
        const data = await res.json();
        setCompany(data);
        if (data.policies?.length > 0) {
          setActiveTab(data.policies[0].policy_type);
        }
      } catch {
        setError("Company not found");
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 2rem" }}>
        <div
          className="skeleton"
          style={{ width: "300px", height: "40px", marginBottom: "1rem" }}
        />
        <div
          className="skeleton"
          style={{ width: "200px", height: "20px", marginBottom: "2rem" }}
        />
        <div className="skeleton" style={{ width: "100%", height: "400px" }} />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div
        className="container"
        style={{ padding: "6rem 2rem", textAlign: "center" }}
      >
        <h1 style={{ marginBottom: "1rem" }}>Company Not Found</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          We don&apos;t have data for this company yet.
        </p>
        <Link
          href="/"
          className="btn btn-primary"
          style={{ marginTop: "2rem" }}
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const activePolicy = company.policies?.find(
    (p) => p.policy_type === activeTab,
  );
  const policyTypeLabels: Record<string, string> = {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    usage: "Acceptable Use",
    eula: "EULA",
  };

  return (
    <div className="container" style={{ padding: "3rem 2rem" }}>
      {/* Company Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "2rem",
          marginBottom: "3rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            flexShrink: 0,
          }}
        >
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt={company.name}
              width={56}
              height={56}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                fontSize: "2.5rem",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}
            >
              {company.name[0]}
            </span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h1 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>
            {company.name}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span className="category-tag">{company.category}</span>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                {company.website.replace(/https?:\/\/(www\.)?/, "")} ↗
              </a>
            )}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <ScoreGauge score={company.overall_score} size={140} />
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginTop: "0.5rem",
              maxWidth: "160px",
            }}
          >
            Lower score = more user-friendly
          </p>
        </div>
      </div>

      {/* Policy Tabs */}
      {company.policies && company.policies.length > 0 && (
        <>
          <div className="tabs" style={{ marginBottom: "2rem" }}>
            {company.policies.map((policy) => (
              <button
                key={policy.policy_type}
                className={`tab ${activeTab === policy.policy_type ? "active" : ""}`}
                onClick={() => setActiveTab(policy.policy_type)}
              >
                {policyTypeLabels[policy.policy_type] || policy.policy_type}
              </button>
            ))}
          </div>

          {activePolicy ? (
            <div className="animate-in" key={activeTab}>
              {/* Summary + Risk */}
              {activePolicy.overall_summary ? (
                <>
                  <div
                    className="card"
                    style={{ padding: "2rem", marginBottom: "1.5rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                        marginBottom: "1.25rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <h2 style={{ fontSize: "1.35rem" }}>
                        {policyTypeLabels[activePolicy.policy_type] ||
                          activePolicy.policy_type}
                      </h2>
                      <RiskBadge level={activePolicy.risk_level} />
                    </div>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.8,
                        marginBottom: "1.5rem",
                      }}
                    >
                      {activePolicy.overall_summary}
                    </p>
                    {activePolicy.risk_summary && (
                      <div
                        style={{
                          padding: "1rem 1.25rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "var(--radius-sm)",
                          borderLeft: `3px solid ${
                            activePolicy.risk_level === "low"
                              ? "var(--accent-green)"
                              : activePolicy.risk_level === "medium"
                                ? "var(--accent-yellow)"
                                : "var(--accent-red)"
                          }`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                          }}
                        >
                          {activePolicy.risk_summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Risk Breakdown */}
                  <div
                    className="card"
                    style={{ padding: "2rem", marginBottom: "1.5rem" }}
                  >
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                      Risk Breakdown
                    </h3>
                    <ScoreBar
                      score={activePolicy.score_data_privacy}
                      label="Data Privacy"
                      note={activePolicy.note_data_privacy}
                    />
                    <ScoreBar
                      score={activePolicy.score_user_rights}
                      label="User Rights"
                      note={activePolicy.note_user_rights}
                    />
                    <ScoreBar
                      score={activePolicy.score_billing}
                      label="Billing & Payments"
                      note={activePolicy.note_billing}
                    />
                    <ScoreBar
                      score={activePolicy.score_legal_exposure}
                      label="Legal Exposure"
                      note={activePolicy.note_legal_exposure}
                    />
                  </div>

                  {/* Category Breakdowns */}
                  <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
                    <CategoryBreakdown
                      title="Data Collected"
                      icon="📊"
                      items={activePolicy.data_collected}
                      accentColor="var(--accent-blue)"
                    />
                    <CategoryBreakdown
                      title="Who They Share It With"
                      icon="🔗"
                      items={activePolicy.data_sharing}
                      accentColor="var(--accent-purple)"
                    />
                    <CategoryBreakdown
                      title="Your Rights"
                      icon="🛡️"
                      items={activePolicy.your_rights}
                      accentColor="var(--accent-green)"
                    />
                    <CategoryBreakdown
                      title="What You Give Up"
                      icon="⚠️"
                      items={activePolicy.what_you_give_up}
                      accentColor="var(--accent-yellow)"
                    />
                    <CategoryBreakdown
                      title="Billing & Auto-Renewals"
                      icon="💳"
                      items={activePolicy.billing}
                      accentColor="var(--accent-blue)"
                    />
                    <CategoryBreakdown
                      title="Red Flags"
                      icon="🚩"
                      items={activePolicy.risk_flags}
                      accentColor="var(--accent-red)"
                    />
                  </div>

                  {/* Meta info */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 0",
                      borderTop: "1px solid var(--border-color)",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}
                    >
                      {activePolicy.analyzed_at && (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          Analyzed:{" "}
                          {new Date(
                            activePolicy.analyzed_at,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {activePolicy.version_number && (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          Version: {activePolicy.version_number}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <a
                        href={activePolicy.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: "0.85rem" }}
                      >
                        View original policy →
                      </a>
                      <Link
                        href={`/${slug}/${activePolicy.slug}/history`}
                        className="btn btn-secondary"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Version history
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      marginBottom: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Not Yet Analyzed
                  </h3>
                  <p
                    style={{
                      color: "var(--text-tertiary)",
                      maxWidth: "450px",
                      margin: "0 auto",
                    }}
                  >
                    This policy has been indexed but not yet analyzed by our AI.
                    It will be analyzed in the next crawl cycle.
                  </p>
                  {activePolicy.source_url && (
                    <a
                      href={activePolicy.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ marginTop: "1.5rem" }}
                    >
                      View original policy →
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </>
      )}

      {/* Disclaimer */}
      <div
        style={{
          marginTop: "3rem",
          padding: "1rem 1.25rem",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          ⚖️ This is an AI-generated summary for informational purposes only.
          Not legal advice. Always read the original policy.
        </p>
      </div>
    </div>
  );
}
