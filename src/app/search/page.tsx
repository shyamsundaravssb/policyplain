"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CompanyCard from "@/components/CompanyCard";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  category: string;
  overall_score: number;
  policy_count: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitForm, setSubmitForm] = useState({
    company_name: "",
    policy_url: "",
    policy_type: "privacy",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitForm),
      });
      const data = await res.json();
      setSubmitMsg(res.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch {
      setSubmitMsg("❌ Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "0.7rem 1rem",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "var(--font-body)",
  };

  return (
    <div className="container" style={{ padding: "3rem 2rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>
        {q ? `Search results for "${q}"` : "Search"}
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem" }}>
        {!loading &&
          `${results.length} result${results.length !== 1 ? "s" : ""} found`}
      </p>
      {loading ? (
        <div className="grid-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "200px", borderRadius: "var(--radius-md)" }}
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid-3">
          {results.map((c) => (
            <CompanyCard key={c.slug} {...c} />
          ))}
        </div>
      ) : q ? (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            className="card"
            style={{ padding: "2.5rem", textAlign: "center" }}
          >
            <h3 style={{ marginBottom: "0.75rem" }}>Not in our database yet</h3>
            <p style={{ color: "var(--text-tertiary)", marginBottom: "2rem" }}>
              Submit a policy URL and we&apos;ll analyze it.
            </p>
            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "0.4rem",
                  }}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  value={submitForm.company_name}
                  onChange={(e) =>
                    setSubmitForm({
                      ...submitForm,
                      company_name: e.target.value,
                    })
                  }
                  placeholder="e.g. Acme Corp"
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "0.4rem",
                  }}
                >
                  Policy URL
                </label>
                <input
                  type="url"
                  value={submitForm.policy_url}
                  onChange={(e) =>
                    setSubmitForm({ ...submitForm, policy_url: e.target.value })
                  }
                  placeholder="https://example.com/privacy"
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "0.4rem",
                  }}
                >
                  Policy Type
                </label>
                <select
                  value={submitForm.policy_type}
                  onChange={(e) =>
                    setSubmitForm({
                      ...submitForm,
                      policy_type: e.target.value,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="privacy">Privacy Policy</option>
                  <option value="terms">Terms of Service</option>
                  <option value="cookies">Cookie Policy</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {submitting ? "Analyzing..." : "Submit for Analysis"}
              </button>
              {submitMsg && (
                <p
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.88rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  {submitMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "3rem 2rem" }}>
          <div
            className="skeleton"
            style={{ width: "300px", height: "40px" }}
          />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
