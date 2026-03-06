import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
      FROM companies c 
      ORDER BY c.name ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}
