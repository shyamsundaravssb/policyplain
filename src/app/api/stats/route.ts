import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const companiesCount = await query(
      "SELECT COUNT(*) as count FROM companies",
    );
    const policiesCount = await query("SELECT COUNT(*) as count FROM policies");
    const versionsCount = await query(
      "SELECT COUNT(*) as count FROM policy_versions",
    );

    return NextResponse.json({
      companies: parseInt(companiesCount.rows[0].count),
      policies: parseInt(policiesCount.rows[0].count),
      versions: parseInt(versionsCount.rows[0].count),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
