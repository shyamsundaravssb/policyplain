"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RiskBadge from "@/components/RiskBadge";
import Link from "next/link";

interface VersionEntry {
  id: string;
  version_number: number;
  analyzed_at: string;
  created_at: string;
  is_current: boolean;
  overall_summary: string;
  risk_level: "low" | "medium" | "high";
  risk_summary: string;
  score_data_privacy: number;
  score_user_rights: number;
  score_billing: number;
  score_legal_exposure: number;
}

export default function VersionHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const policyType = params.policyType as string;
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const policyLabels: Record<string, string> = {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    usage: "Acceptable Use",
    eula: "EULA",
  };

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/companies/${slug}/${policyType}/history`);
        if (res.ok) {
          const data = await res.json();
          setVersions(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [slug, policyType]);

  function getAvgScore(v: VersionEntry) {
    return (
      (v.score_data_privacy +
        v.score_user_rights +
        v.score_billing +
        v.score_legal_exposure) /
      4
    ).toFixed(1);
  }

  function getRiskTrend(current: VersionEntry, previous: VersionEntry) {
    const currentScore = parseFloat(getAvgScore(current));
    const prevScore = parseFloat(getAvgScore(previous));
    if (currentScore > prevScore)
      return {
        direction: "↑",
        color: "var(--accent-red)",
        label: "Risk increased",
      };
    if (currentScore < prevScore)
      return {
        direction: "↓",
        color: "var(--accent-green)",
        label: "Risk decreased",
      };
    return { direction: "→", color: "var(--text-muted)", label: "Unchanged" };
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 2rem" }}>
        <div
          className="skeleton"
          style={{ width: "300px", height: "40px", marginBottom: "2rem" }}
        />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: "100%", height: "100px", marginBottom: "0.75rem" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: "3rem 2rem", maxWidth: "800px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <Link
          href={`/${slug}`}
          style={{
            color: "var(--text-tertiary)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          ← Back to {slug}
        </Link>
        <h1 style={{ marginTop: "1rem", fontSize: "2rem" }}>Version History</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          {policyLabels[policyType] || policyType} — {versions.length} version
          {versions.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* Timeline */}
      {versions.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-tertiary)" }}>
            No versions analyzed yet for this policy.
          </p>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div
            style={{
              position: "absolute",
              left: "19px",
              top: "0",
              bottom: "0",
              width: "2px",
              background: "var(--border-color)",
            }}
          />

          {versions.map((version, idx) => {
            const trend =
              idx < versions.length - 1
                ? getRiskTrend(version, versions[idx + 1])
                : null;
            const isExpanded = expandedId === version.id;

            return (
              <div
                key={version.id}
                style={{
                  position: "relative",
                  paddingLeft: "3rem",
                  paddingBottom: "1.5rem",
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "6px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: version.is_current
                      ? "var(--accent-green)"
                      : "var(--bg-elevated)",
                    border: `2px solid ${version.is_current ? "var(--accent-green)" : "var(--border-color)"}`,
                    zIndex: 1,
                  }}
                />

                <div
                  className="card"
                  style={{
                    cursor: "pointer",
                    padding: "1.25rem",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : version.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          v{version.version_number}
                        </span>
                        {version.is_current && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              padding: "0.15rem 0.5rem",
                              background: "var(--accent-green-dim)",
                              color: "var(--accent-green)",
                              borderRadius: "100px",
                              fontWeight: 600,
                            }}
                          >
                            CURRENT
                          </span>
                        )}
                        <RiskBadge level={version.risk_level} />
                      </div>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {new Date(
                          version.analyzed_at || version.created_at,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      {trend && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.85rem",
                            color: trend.color,
                            fontWeight: 600,
                          }}
                        >
                          {trend.direction} {trend.label}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {getAvgScore(version)}
                      </span>
                    </div>
                  </div>

                  {isExpanded && version.overall_summary && (
                    <div
                      style={{
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--border-subtle)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.7,
                          marginBottom: "1rem",
                        }}
                      >
                        {version.overall_summary}
                      </p>
                      {version.risk_summary && (
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-tertiary)",
                            lineHeight: 1.6,
                            fontStyle: "italic",
                          }}
                        >
                          {version.risk_summary}
                        </p>
                      )}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "0.75rem",
                          marginTop: "1rem",
                        }}
                      >
                        {[
                          {
                            label: "Privacy",
                            score: version.score_data_privacy,
                          },
                          { label: "Rights", score: version.score_user_rights },
                          { label: "Billing", score: version.score_billing },
                          {
                            label: "Legal",
                            score: version.score_legal_exposure,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              textAlign: "center",
                              padding: "0.5rem",
                              background: "var(--bg-secondary)",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color:
                                  item.score <= 3
                                    ? "var(--accent-green)"
                                    : item.score <= 6
                                      ? "var(--accent-yellow)"
                                      : "var(--accent-red)",
                              }}
                            >
                              {item.score}
                            </div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                                marginTop: "0.15rem",
                              }}
                            >
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
