import SearchBar from "@/components/SearchBar";
import CompanyCard from "@/components/CompanyCard";
import RecentlyUpdatedList from "@/components/RecentlyUpdatedList";
import { query } from "@/lib/db";

interface Company {
  id: string;
  name: string;
  slug: string;
  category: string;
  overall_score: number;
  logo_url: string;
  website: string;
  policy_count: number;
  updated_at: string;
}

async function getCompanies(): Promise<Company[]> {
  try {
    const result = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
      FROM companies c 
      ORDER BY c.name ASC
      LIMIT 12
    `);
    return result.rows;
  } catch {
    return [];
  }
}

async function getRecentlyUpdated(): Promise<Company[]> {
  try {
    const result = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
      FROM companies c 
      ORDER BY c.updated_at DESC
      LIMIT 5
    `);
    return result.rows;
  } catch {
    return [];
  }
}

async function getBestCompanies(): Promise<Company[]> {
  try {
    const result = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
      FROM companies c 
      ORDER BY c.overall_score ASC
      LIMIT 5
    `);
    return result.rows;
  } catch {
    return [];
  }
}

async function getWorstCompanies(): Promise<Company[]> {
  try {
    const result = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
      FROM companies c 
      ORDER BY c.overall_score DESC
      LIMIT 5
    `);
    return result.rows;
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const companiesCount = await query(
      "SELECT COUNT(*) as count FROM companies",
    );
    const policiesCount = await query("SELECT COUNT(*) as count FROM policies");
    const versionsCount = await query(
      "SELECT COUNT(*) as count FROM policy_versions",
    );
    return {
      companies: parseInt(companiesCount.rows[0].count),
      policies: parseInt(policiesCount.rows[0].count),
      versions: parseInt(versionsCount.rows[0].count),
    };
  } catch {
    return { companies: 0, policies: 0, versions: 0 };
  }
}

function getScoreColor(score: number) {
  if (score <= 3) return "var(--accent-green)";
  if (score <= 6) return "var(--accent-yellow)";
  return "var(--accent-red)";
}

export default async function HomePage() {
  const [companies, recentlyUpdated, bestCompanies, worstCompanies, stats] =
    await Promise.all([
      getCompanies(),
      getRecentlyUpdated(),
      getBestCompanies(),
      getWorstCompanies(),
      getStats(),
    ]);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          padding: "6rem 2rem 4rem",
          textAlign: "center",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(46, 204, 113, 0.06) 0%, transparent 60%)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: 800,
              marginBottom: "1.25rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Legal policies in{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-green), #27ae60)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              plain English
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Understand what you&apos;re actually agreeing to. Every policy
            simplified, scored, and tracked — so you know what&apos;s happening
            with your data.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SearchBar large />
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              marginTop: "3rem",
              padding: "1.25rem 0",
              borderTop: "1px solid var(--border-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {[
              { label: "Companies Indexed", value: stats.companies },
              { label: "Policies Analyzed", value: stats.policies },
              { label: "Versions Tracked", value: stats.versions },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--accent-green)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: "0.25rem",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Featured Companies */}
        {companies.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2>Featured Companies</h2>
              <a href="/rankings">View all rankings →</a>
            </div>
            <div className="grid-4">
              {companies.map((company) => (
                <CompanyCard
                  key={company.slug}
                  name={company.name}
                  slug={company.slug}
                  category={company.category}
                  overall_score={company.overall_score}
                  policy_count={company.policy_count}
                  logo_url={company.logo_url}
                  website={company.website}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Updated */}
        {recentlyUpdated.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-header">
              <h2>Recently Updated</h2>
            </div>
            <RecentlyUpdatedList companies={recentlyUpdated} />
          </section>
        )}

        {/* Rankings Preview */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <h2>Rankings Preview</h2>
            <a href="/rankings">Full rankings →</a>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            {/* Best */}
            <div>
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--accent-green)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ✓ Most User-Friendly
              </h3>
              {bestCompanies.map((company, idx) => (
                <a
                  key={company.slug}
                  href={`/${company.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      width: "1.5rem",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500 }}
                  >
                    {company.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: getScoreColor(company.overall_score),
                      fontSize: "0.85rem",
                    }}
                  >
                    {company.overall_score.toFixed(1)}
                  </span>
                </a>
              ))}
            </div>
            {/* Worst */}
            <div>
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--accent-red)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ✕ Least User-Friendly
              </h3>
              {worstCompanies.map((company, idx) => (
                <a
                  key={company.slug}
                  href={`/${company.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      width: "1.5rem",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500 }}
                  >
                    {company.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: getScoreColor(company.overall_score),
                      fontSize: "0.85rem",
                    }}
                  >
                    {company.overall_score.toFixed(1)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
