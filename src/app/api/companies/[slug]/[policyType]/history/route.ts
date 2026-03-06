import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; policyType: string }> },
) {
  try {
    const { slug, policyType } = await params;

    const result = await query(
      `SELECT pv.id, pv.version_number, pv.content_hash, pv.analyzed_at, pv.is_current,
              pv.overall_summary, pv.risk_level, pv.risk_summary,
              pv.score_data_privacy, pv.score_user_rights, pv.score_billing, pv.score_legal_exposure,
              pv.note_data_privacy, pv.note_user_rights, pv.note_billing, pv.note_legal_exposure,
              pv.data_collected, pv.data_sharing, pv.your_rights, pv.what_you_give_up,
              pv.billing, pv.risk_flags, pv.created_at
       FROM policy_versions pv
       JOIN policies p ON p.id = pv.policy_id
       JOIN companies c ON c.id = p.company_id
       WHERE c.slug = $1 AND p.slug = $2
       ORDER BY pv.version_number DESC`,
      [slug, policyType],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No versions found" }, { status: 404 });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching version history:", error);
    return NextResponse.json(
      { error: "Failed to fetch version history" },
      { status: 500 },
    );
  }
}
