import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Return distinct categories if requested
    const wantCategories = request.nextUrl.searchParams.get("categories");
    if (wantCategories === "true") {
      const catResult = await query(
        `SELECT DISTINCT category FROM companies WHERE category IS NOT NULL AND category != 'Uncategorized' ORDER BY category ASC`,
      );
      return NextResponse.json(
        catResult.rows.map((r: { category: string }) => r.category),
      );
    }

    const category = request.nextUrl.searchParams.get("category") || "";
    const sort = request.nextUrl.searchParams.get("sort") || "worst";

    let sql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
      FROM companies c 
      WHERE 1=1
    `;
    const params: string[] = [];

    if (category) {
      params.push(category);
      sql += ` AND c.category = $${params.length}`;
    }

    sql +=
      sort === "best"
        ? " ORDER BY c.overall_score ASC"
        : " ORDER BY c.overall_score DESC";

    const result = await query(sql, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 },
    );
  }
}
