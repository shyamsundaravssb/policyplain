import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { analyzePolicy, computeOverallScore } from "@/lib/analyzer";
import * as cheerio from "cheerio";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { policy_id } = body;

    if (!policy_id) {
      return NextResponse.json(
        { error: "policy_id is required" },
        { status: 400 },
      );
    }

    // Get policy details
    const policyResult = await query(
      `SELECT p.*, c.id as company_id, c.name as company_name
       FROM policies p
       JOIN companies c ON c.id = p.company_id
       WHERE p.id = $1`,
      [policy_id],
    );

    if (policyResult.rows.length === 0) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const policy = policyResult.rows[0];

    // Fetch policy text
    const response = await fetch(policy.source_url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PolicyPlain/1.0)" },
    });

    if (!response.ok) {
      // Log failure
      await query(
        `INSERT INTO crawl_log (policy_id, status, error_message, new_version_created)
         VALUES ($1, 'url_not_found', $2, false)`,
        [policy_id, `HTTP ${response.status}`],
      );
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 502 },
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, nav, header, footer, iframe, noscript").remove();
    const policyText = $(
      'main, article, .content, .policy, [role="main"], body',
    )
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const contentHash = crypto
      .createHash("sha256")
      .update(policyText)
      .digest("hex");

    // Check if unchanged
    const existingVersion = await query(
      "SELECT content_hash FROM policy_versions WHERE policy_id = $1 AND is_current = true",
      [policy_id],
    );

    if (
      existingVersion.rows.length > 0 &&
      existingVersion.rows[0].content_hash === contentHash
    ) {
      await query(
        `INSERT INTO crawl_log (policy_id, status, new_version_created) VALUES ($1, 'unchanged', false)`,
        [policy_id],
      );
      return NextResponse.json({ message: "Policy unchanged", changed: false });
    }

    // Run AI analysis
    const analysis = await analyzePolicy(policyText);
    const overallScore = computeOverallScore(analysis);

    // Get next version number
    const versionResult = await query(
      "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM policy_versions WHERE policy_id = $1",
      [policy_id],
    );
    const nextVersion = versionResult.rows[0].next_version;

    // Archive old, save new
    await query(
      "UPDATE policy_versions SET is_current = false WHERE policy_id = $1 AND is_current = true",
      [policy_id],
    );

    await query(
      `INSERT INTO policy_versions (
        policy_id, version_number, content_hash, raw_text, is_current,
        overall_summary, risk_level, risk_summary,
        score_data_privacy, score_user_rights, score_billing, score_legal_exposure,
        note_data_privacy, note_user_rights, note_billing, note_legal_exposure,
        data_collected, data_sharing, your_rights, what_you_give_up, billing, risk_flags
      ) VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        policy_id,
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

    // Update company score
    const scoreResult = await query(
      `SELECT AVG((pv.score_data_privacy + pv.score_user_rights + pv.score_billing + pv.score_legal_exposure) / 4.0) as avg_score
       FROM policy_versions pv JOIN policies p ON p.id = pv.policy_id
       WHERE p.company_id = $1 AND pv.is_current = true`,
      [policy.company_id],
    );
    await query(
      "UPDATE companies SET overall_score = $1, updated_at = NOW() WHERE id = $2",
      [
        Math.round((scoreResult.rows[0].avg_score || overallScore) * 10) / 10,
        policy.company_id,
      ],
    );

    // Log success
    await query(
      `INSERT INTO crawl_log (policy_id, status, new_version_created) VALUES ($1, 'success', true)`,
      [policy_id],
    );

    return NextResponse.json({
      message: "Analysis complete",
      changed: true,
      version: nextVersion,
    });
  } catch (error) {
    console.error("Error analyzing policy:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
