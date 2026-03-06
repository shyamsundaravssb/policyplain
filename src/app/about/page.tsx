import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PolicyPlain — How It Works",
  description:
    "Learn how PolicyPlain simplifies legal policies, our scoring methodology, and how policies are kept up to date.",
};

export default function AboutPage() {
  return (
    <div
      className="container"
      style={{ padding: "3rem 2rem", maxWidth: "800px" }}
    >
      {/* Hero */}
      <div style={{ marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          About Policy
          <span style={{ color: "var(--accent-green)" }}>Plain</span>
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
            lineHeight: 1.8,
          }}
        >
          Legal policies are deliberately complex. Users never read them,
          causing real harm. PolicyPlain exists to fix this by maintaining a
          permanent, public record of what companies&apos; policies actually
          mean.
        </p>
      </div>

      {/* The Problem */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>
          The Problem
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              icon: "😵",
              text: "Users blindly agree to policies they don't understand",
            },
            {
              icon: "🔇",
              text: "Policies change silently without notifying users",
            },
            {
              icon: "📋",
              text: "There is no single trustworthy public record of what policies actually mean",
            },
            {
              icon: "⚖️",
              text: "There is no accountability system that ranks companies on fairness",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.25rem",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>
          How It Works
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {[
            {
              step: "01",
              title: "Policy is Indexed",
              desc: "A company's policy is submitted via our browser extension or found by our automated crawler. The raw text is extracted and stored permanently.",
            },
            {
              step: "02",
              title: "AI Analysis",
              desc: "Our AI reads the full policy and generates a structured analysis: a plain English summary, risk scores across 4 dimensions, and categorized breakdowns of what the policy means for you.",
            },
            {
              step: "03",
              title: "Permanent URL Created",
              desc: "Every company gets a permanent URL (e.g., /google/privacy) that always shows the latest analysis. Old versions are archived, never deleted.",
            },
            {
              step: "04",
              title: "Continuous Monitoring",
              desc: "Our crawler re-checks every policy weekly. If the policy text has changed, a new version is analyzed and the public page updates automatically. You can see exactly what changed and when.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--accent-green)",
                  opacity: 0.5,
                  flexShrink: 0,
                  width: "3rem",
                }}
              >
                {item.step}
              </span>
              <div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring Methodology */}
      <section id="methodology" style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>
          Scoring Methodology
        </h2>
        <div className="card" style={{ padding: "2rem" }}>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              lineHeight: 1.8,
              marginBottom: "1.5rem",
            }}
          >
            Every policy is scored on a{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              0 to 10 scale
            </strong>{" "}
            across four dimensions. Lower scores are better for users. The
            overall company score is the average across all analyzed policies.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {[
              {
                label: "Data Privacy",
                desc: "What data is collected and how it's used",
              },
              {
                label: "User Rights",
                desc: "What rights you retain or give up",
              },
              {
                label: "Billing & Payments",
                desc: "Auto-renewals, hidden fees, cancellation",
              },
              {
                label: "Legal Exposure",
                desc: "Arbitration, liability limits, jurisdiction",
              },
            ].map((dim) => (
              <div
                key={dim.label}
                style={{
                  padding: "1rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "0.3rem",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {dim.label}
                </h4>
                <p
                  style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}
                >
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              {
                range: "0-3",
                color: "var(--accent-green)",
                label: "User Friendly",
              },
              { range: "4-6", color: "var(--accent-yellow)", label: "Average" },
              { range: "7-9", color: "var(--accent-red)", label: "Concerning" },
              { range: "10", color: "var(--accent-darkred)", label: "Harmful" },
            ].map((tier) => (
              <div
                key={tier.range}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.75rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: tier.color,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: tier.color,
                    fontWeight: 600,
                  }}
                >
                  {tier.range}
                </span>
                <span
                  style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}
                >
                  {tier.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>
          Our Principles
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {[
            "Every simplified policy links back to the original source — always",
            "Version history is never deleted — only archived",
            "Companies cannot pay to improve their score or remove their listing",
            "The scoring methodology is publicly documented (you're reading it)",
            "This is informational only, not legal advice",
          ].map((principle, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.9rem 1.25rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>
                ✓
              </span>
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
              >
                {principle}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section
        style={{
          padding: "2rem",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          ⚖️ Legal Disclaimer
        </h3>
        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: "0.88rem",
            lineHeight: 1.7,
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          PolicyPlain provides AI-generated summaries for informational purposes
          only. Nothing on this site constitutes legal advice. Always read the
          original policy and consult a legal professional for decisions that
          affect your rights.
        </p>
      </section>
    </div>
  );
}
