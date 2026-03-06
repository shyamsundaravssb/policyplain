import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json([]);
    }

    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM policies p WHERE p.company_id = c.id AND p.is_active = true) as policy_count
       FROM companies c 
       WHERE c.name ILIKE $1 OR c.slug ILIKE $1
         OR similarity(c.name, $2) > 0.2
       ORDER BY similarity(c.name, $2) DESC, c.name ASC
       LIMIT 20`,
      [`%${q}%`, q],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error searching companies:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
