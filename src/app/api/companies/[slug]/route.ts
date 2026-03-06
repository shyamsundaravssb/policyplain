import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const companyResult = await query(
      "SELECT * FROM companies WHERE slug = $1",
      [slug],
    );

    if (companyResult.rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = companyResult.rows[0];

    // Get all policies with their current versions
    const policiesResult = await query(
      `SELECT p.*, pv.overall_summary, pv.risk_level, pv.risk_summary,
              pv.score_data_privacy, pv.score_user_rights, pv.score_billing, pv.score_legal_exposure,
              pv.note_data_privacy, pv.note_user_rights, pv.note_billing, pv.note_legal_exposure,
              pv.data_collected, pv.data_sharing, pv.your_rights, pv.what_you_give_up,
              pv.billing, pv.risk_flags, pv.analyzed_at, pv.version_number
       FROM policies p
       LEFT JOIN policy_versions pv ON pv.policy_id = p.id AND pv.is_current = true
       WHERE p.company_id = $1 AND p.is_active = true
       ORDER BY p.policy_type`,
      [company.id],
    );

    return NextResponse.json({
      ...company,
      policies: policiesResult.rows,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 },
    );
  }
}
