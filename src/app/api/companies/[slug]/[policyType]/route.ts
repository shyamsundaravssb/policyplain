import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; policyType: string }> },
) {
  try {
    const { slug, policyType } = await params;

    const result = await query(
      `SELECT pv.*, p.source_url, p.policy_type, c.name as company_name, c.slug as company_slug
       FROM policy_versions pv
       JOIN policies p ON p.id = pv.policy_id
       JOIN companies c ON c.id = p.company_id
       WHERE c.slug = $1 AND p.slug = $2 AND pv.is_current = true`,
      [slug, policyType],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching policy:", error);
    return NextResponse.json(
      { error: "Failed to fetch policy" },
      { status: 500 },
    );
  }
}
