import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { analyzePolicy, computeOverallScore } from "@/lib/analyzer";
import crypto from "crypto";

// ─── Helpers ──────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function inferCompanyName(title: string, domain: string): string {
  // Try to get a clean name from the page title
  // e.g. "Privacy Policy | Spotify" → "Spotify"
  // e.g. "Google Privacy Policy" → "Google"
  const separators = [" | ", " - ", " — ", " – ", " :: ", " · "];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      // Pick the shortest part that's likely the brand name (not "Privacy Policy")
      const candidate = parts
        .filter((p) => p.trim().length > 1)
        .sort((a, b) => a.trim().length - b.trim().length)[0];
      if (
        candidate &&
        candidate.trim().length > 1 &&
        candidate.trim().length < 40
      ) {
        return candidate.trim();
      }
    }
  }

  // Strip common policy keywords from title
  const cleaned = title
    .replace(
      /\b(privacy\s*policy|terms\s*(of\s*service|and\s*conditions|of\s*use)|cookie\s*policy|legal|eula|end\s*user\s*license\s*agreement)\b/gi,
      "",
    )
    .trim();
  if (cleaned.length > 1 && cleaned.length < 60) {
    return cleaned;
  }

  // Fall back to domain-based name
  const parts = domain.split(".");
  const name = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function inferPolicyType(
  url: string,
  title: string,
): "privacy" | "terms" | "cookies" | "eula" {
  const combined = `${url} ${title}`.toLowerCase();
  if (combined.includes("privacy")) return "privacy";
  if (combined.includes("cookie")) return "cookies";
  if (combined.includes("eula") || combined.includes("license")) return "eula";
  if (
    combined.includes("terms") ||
    combined.includes("conditions") ||
    combined.includes("agreement")
  )
    return "terms";
  return "terms"; // default
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Route Handler ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // --- Auth ---
  const extensionKey = request.headers.get("x-extension-key");
  const expectedKey = process.env.EXTENSION_API_KEY;

  if (!expectedKey || !extensionKey || extensionKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { url, title, text } = body;

    if (!url || !text) {
      return NextResponse.json(
        { success: false, error: "url and text are required" },
        { status: 400 },
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Policy text is too short to analyze (min 100 chars)",
        },
        { status: 400 },
      );
    }

    const policyText = text.substring(0, 15000);
    const domain = extractDomain(url);
    const policyType = inferPolicyType(url, title || "");
    const contentHash = crypto
      .createHash("sha256")
      .update(policyText)
      .digest("hex");

    // --- Try to match existing company by domain ---
    let companyRow = (
      await query(
        `SELECT id, slug, category FROM companies
         WHERE website ILIKE $1 OR website ILIKE $2
         LIMIT 1`,
        [`%${domain}%`, `%${domain.split(".").slice(-2).join(".")}%`],
      )
    ).rows[0];

    let isNew = !companyRow;
    const companyName = inferCompanyName(title || "", domain);
    const slug = companyRow?.slug || slugify(companyName);

    // --- Check if current version already has this hash (skip Groq) ---
    if (companyRow) {
      const existingPolicy = await query(
        `SELECT p.id FROM policies p WHERE p.company_id = $1 AND p.policy_type = $2`,
        [companyRow.id, policyType],
      );

      if (existingPolicy.rows.length > 0) {
        const existingVersion = await query(
          `SELECT pv.* FROM policy_versions pv
           WHERE pv.policy_id = $1 AND pv.is_current = true AND pv.content_hash = $2`,
          [existingPolicy.rows[0].id, contentHash],
        );

        if (existingVersion.rows.length > 0) {
          // Hash matches — return cached analysis, no Groq call
          const v = existingVersion.rows[0];
          const backendUrl =
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          return NextResponse.json({
            success: true,
            isNew: false,
            companySlug: slug,
            policyType,
            permanentUrl: `${backendUrl}/${slug}/${policyType}`,
            versionNumber: v.version_number,
            analysis: {
              overall_summary: v.overall_summary,
              risk_level: v.risk_level,
              risk_summary: v.risk_summary,
              risk_breakdown: {
                data_privacy: {
                  score: v.score_data_privacy,
                  note: v.note_data_privacy,
                },
                user_rights: {
                  score: v.score_user_rights,
                  note: v.note_user_rights,
                },
                billing: { score: v.score_billing, note: v.note_billing },
                legal_exposure: {
                  score: v.score_legal_exposure,
                  note: v.note_legal_exposure,
                },
              },
              categories: {
                data_collected: safeJsonParse(v.data_collected),
                data_sharing: safeJsonParse(v.data_sharing),
                your_rights: safeJsonParse(v.your_rights),
                what_you_give_up: safeJsonParse(v.what_you_give_up),
                billing: safeJsonParse(v.billing),
                risk_flags: safeJsonParse(v.risk_flags),
              },
            },
          });
        }
      }
    }

    // --- Run AI analysis ---
    const analysis = await analyzePolicy(policyText);
    const overallScore = computeOverallScore(analysis);
    const detectedCategory = analysis.company_category || "Technology";
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const website = new URL(url).origin;

    // --- Create company if new ---
    if (!companyRow) {
      const insertResult = await query(
        `INSERT INTO companies (name, slug, website, logo_url, category, overall_score)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET name = $1
         RETURNING id, slug, category`,
        [companyName, slug, website, logoUrl, detectedCategory, overallScore],
      );
      companyRow = insertResult.rows[0];
    } else if (companyRow.category === "Uncategorized") {
      await query(
        `UPDATE companies SET category = $1, logo_url = COALESCE(logo_url, $2) WHERE id = $3`,
        [detectedCategory, logoUrl, companyRow.id],
      );
    }

    // --- Find or create policy ---
    let policyResult = await query(
      `SELECT id FROM policies WHERE company_id = $1 AND policy_type = $2`,
      [companyRow.id, policyType],
    );

    if (policyResult.rows.length === 0) {
      policyResult = await query(
        `INSERT INTO policies (company_id, policy_type, source_url, slug, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id`,
        [companyRow.id, policyType, url, policyType],
      );
    } else {
      // Update source URL if changed
      await query(`UPDATE policies SET source_url = $1 WHERE id = $2`, [
        url,
        policyResult.rows[0].id,
      ]);
    }

    const policyId = policyResult.rows[0].id;

    // --- Get next version number ---
    const versionResult = await query(
      `SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
       FROM policy_versions WHERE policy_id = $1`,
      [policyId],
    );
    const nextVersion = versionResult.rows[0].next_version;

    // Archive current version
    await query(
      `UPDATE policy_versions SET is_current = false
       WHERE policy_id = $1 AND is_current = true`,
      [policyId],
    );

    // --- Save new version ---
    await query(
      `INSERT INTO policy_versions (
        policy_id, version_number, content_hash, raw_text, is_current,
        overall_summary, risk_level, risk_summary,
        score_data_privacy, score_user_rights, score_billing, score_legal_exposure,
        note_data_privacy, note_user_rights, note_billing, note_legal_exposure,
        data_collected, data_sharing, your_rights, what_you_give_up, billing, risk_flags
      ) VALUES ($1,$2,$3,$4,true,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        policyId,
        nextVersion,
        contentHash,
        policyText,
        analysis.overall_summary,
        analysis.risk_level,
        analysis.risk_summary,
        analysis.risk_breakdown.data_privacy.score,
        analysis.risk_breakdown.user_rights.score,
        analysis.risk_breakdown.billing.score,
        analysis.risk_breakdown.legal_exposure.score,
        analysis.risk_breakdown.data_privacy.note,
        analysis.risk_breakdown.user_rights.note,
        analysis.risk_breakdown.billing.note,
        analysis.risk_breakdown.legal_exposure.note,
        JSON.stringify(analysis.categories.data_collected),
        JSON.stringify(analysis.categories.data_sharing),
        JSON.stringify(analysis.categories.your_rights),
        JSON.stringify(analysis.categories.what_you_give_up),
        JSON.stringify(analysis.categories.billing),
        JSON.stringify(analysis.categories.risk_flags),
      ],
    );

    // --- Update company score ---
    const scoreResult = await query(
      `SELECT AVG((pv.score_data_privacy + pv.score_user_rights + pv.score_billing + pv.score_legal_exposure) / 4.0) as avg_score
       FROM policy_versions pv
       JOIN policies p ON p.id = pv.policy_id
       WHERE p.company_id = $1 AND pv.is_current = true`,
      [companyRow.id],
    );
    const newScore =
      Math.round((scoreResult.rows[0].avg_score || overallScore) * 10) / 10;
    await query(
      `UPDATE companies SET overall_score = $1, updated_at = NOW() WHERE id = $2`,
      [newScore, companyRow.id],
    );

    const backendUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      isNew,
      companySlug: slug,
      policyType,
      permanentUrl: `${backendUrl}/${slug}/${policyType}`,
      versionNumber: nextVersion,
      analysis: {
        overall_summary: analysis.overall_summary,
        risk_level: analysis.risk_level,
        risk_summary: analysis.risk_summary,
        risk_breakdown: analysis.risk_breakdown,
        categories: analysis.categories,
      },
    });
  } catch (error) {
    console.error("Extension analyze error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze policy",
      },
      { status: 500 },
    );
  }
}

// ─── Utils ────────────────────────────────────────────────────

function safeJsonParse(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
