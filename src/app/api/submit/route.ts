import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { analyzePolicy, computeOverallScore } from "@/lib/analyzer";
import * as cheerio from "cheerio";
import crypto from "crypto";

async function fetchPolicyText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PolicyPlain/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, navigation, headers, footers
  $("script, style, nav, header, footer, iframe, noscript").remove();

  // Get text from the main content area
  const text = $('main, article, .content, .policy, [role="main"], body')
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, policy_url, policy_type } = body;

    if (!company_name || !policy_url || !policy_type) {
      return NextResponse.json(
        { error: "company_name, policy_url, and policy_type are required" },
        { status: 400 },
      );
    }

    const validTypes = ["privacy", "terms", "cookies", "usage", "eula"];
    if (!validTypes.includes(policy_type)) {
      return NextResponse.json(
        { error: `policy_type must be one of: ${validTypes.join(", ")}` },
        { status: 400 },
      );
    }

    // Fetch and parse the policy text
    const policyText = await fetchPolicyText(policy_url);
    if (!policyText || policyText.length < 100) {
      return NextResponse.json(
        { error: "Could not extract sufficient policy text from URL" },
        { status: 400 },
      );
    }

    const contentHash = crypto
      .createHash("sha256")
      .update(policyText)
      .digest("hex");

    // Run AI analysis FIRST so we can extract the company category
    const analysis = await analyzePolicy(policyText);
    const overallScore = computeOverallScore(analysis);
    const detectedCategory = analysis.company_category || "Technology";

    // Derive website and logo from policy URL
    const website = new URL(policy_url).origin;
    const domain = new URL(policy_url).hostname.replace("www.", "");
    const logo_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // Find or create company
    const slug = company_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let companyResult = await query(
      "SELECT id, category FROM companies WHERE slug = $1",
      [slug],
    );

    if (companyResult.rows.length === 0) {
      // Create new company with AI-detected category
      companyResult = await query(
        `INSERT INTO companies (name, slug, website, logo_url, category, overall_score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, category`,
        [company_name, slug, website, logo_url, detectedCategory, overallScore],
      );
    } else if (companyResult.rows[0].category === "Uncategorized") {
      // Update existing company that was previously uncategorized
      await query(
        `UPDATE companies SET category = $1, logo_url = COALESCE(logo_url, $2), website = COALESCE(website, $3) WHERE slug = $4`,
        [detectedCategory, logo_url, website, slug],
      );
    }

    const companyId = companyResult.rows[0].id;

    // Find or create policy
    let policyResult = await query(
      "SELECT id FROM policies WHERE company_id = $1 AND policy_type = $2",
      [companyId, policy_type],
    );

    if (policyResult.rows.length === 0) {
      policyResult = await query(
        `INSERT INTO policies (company_id, policy_type, source_url, slug, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id`,
        [companyId, policy_type, policy_url, policy_type],
      );
    }

    const policyId = policyResult.rows[0].id;

    // Check if content has changed
    const existingVersion = await query(
      "SELECT content_hash FROM policy_versions WHERE policy_id = $1 AND is_current = true",
      [policyId],
    );

    if (
      existingVersion.rows.length > 0 &&
      existingVersion.rows[0].content_hash === contentHash
    ) {
      return NextResponse.json({
        message: "Policy content unchanged",
        changed: false,
      });
    }
    // AI analysis was already done before company creation (for category detection)
    // Get next version number
    const versionResult = await query(
      "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM policy_versions WHERE policy_id = $1",
      [policyId],
    );
    const nextVersion = versionResult.rows[0].next_version;

    // Archive current version
    await query(
      "UPDATE policy_versions SET is_current = false WHERE policy_id = $1 AND is_current = true",
      [policyId],
    );

    // Save new version
    await query(
      `INSERT INTO policy_versions (
        policy_id, version_number, content_hash, raw_text, is_current,
        overall_summary, risk_level, risk_summary,
        score_data_privacy, score_user_rights, score_billing, score_legal_exposure,
        note_data_privacy, note_user_rights, note_billing, note_legal_exposure,
        data_collected, data_sharing, your_rights, what_you_give_up, billing, risk_flags
      ) VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
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

    // Update company overall score
    const scoreResult = await query(
      `SELECT AVG((pv.score_data_privacy + pv.score_user_rights + pv.score_billing + pv.score_legal_exposure) / 4.0) as avg_score
       FROM policy_versions pv
       JOIN policies p ON p.id = pv.policy_id
       WHERE p.company_id = $1 AND pv.is_current = true`,
      [companyId],
    );

    const newOverallScore =
      Math.round((scoreResult.rows[0].avg_score || overallScore) * 10) / 10;
    await query(
      "UPDATE companies SET overall_score = $1, updated_at = NOW() WHERE id = $2",
      [newOverallScore, companyId],
    );

    return NextResponse.json({
      message: "Policy analyzed and saved",
      changed: true,
      version: nextVersion,
      company_slug: slug,
      policy_type,
      overall_score: newOverallScore,
    });
  } catch (error) {
    console.error("Error submitting policy:", error);
    return NextResponse.json(
      { error: "Failed to submit policy" },
      { status: 500 },
    );
  }
}
