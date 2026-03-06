"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  slug: string;
  name: string;
  category: string;
  overall_score: number;
}

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getScoreColor = (score: number) => {
    if (score <= 3) return "var(--accent-green)";
    if (score <= 6) return "var(--accent-yellow)";
    return "var(--accent-red)";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="search-container"
      style={large ? { maxWidth: "720px" } : {}}
    >
      <form onSubmit={handleSubmit}>
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search any company, app, or service..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={
            large
              ? {
                  padding: "1.25rem 1.5rem 1.25rem 3.25rem",
                  fontSize: "1.15rem",
                }
              : {}
          }
        />
      </form>

      {isOpen && (
        <div className="search-dropdown">
          {loading ? (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                color: "var(--text-tertiary)",
              }}
            >
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((company) => (
              <a
                key={company.slug}
                href={`/${company.slug}`}
                className="search-result-item"
                onClick={() => setIsOpen(false)}
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
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  {company.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                    {company.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {company.category}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: getScoreColor(company.overall_score),
                  }}
                >
                  {company.overall_score.toFixed(1)}
                </span>
              </a>
            ))
          ) : (
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              <p
                style={{
                  color: "var(--text-tertiary)",
                  marginBottom: "0.5rem",
                }}
              >
                No companies found for &ldquo;{query}&rdquo;
              </p>
              <a
                href={`/search?q=${encodeURIComponent(query)}`}
                style={{ color: "var(--accent-green)", fontSize: "0.9rem" }}
              >
                Submit this company →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
