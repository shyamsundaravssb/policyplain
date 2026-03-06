/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");
const cheerio = require("cheerio");
const crypto = require("crypto");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are a policy analysis expert who helps everyday users understand what they are agreeing to. Read the given policy text and return a structured JSON analysis.

Return ONLY valid JSON. No markdown. No backticks. No preamble. Every score field MUST be an integer between 0 and 10. Never use text like N/A for scores — use 0 if not applicable.

{
  "site_name": "Company name",
  "policy_type": "Privacy Policy or Terms of Service etc",
  "overall_summary": "3-4 sentences explaining what this policy means for the user.",
  "risk_level": "low or medium or high",
  "risk_breakdown": {
    "data_privacy":   { "score": 5, "note": "one sentence" },
    "user_rights":    { "score": 5, "note": "one sentence" },
    "billing":        { "score": 0, "note": "one sentence" },
    "legal_exposure": { "score": 5, "note": "one sentence" }
  },
  "risk_summary": "2 sentences explaining the risk level",
  "categories": {
    "data_collected": [], "data_sharing": [], "your_rights": [],
    "what_you_give_up": [], "billing": [], "risk_flags": []
  }
}

Scoring: 0-3 = user-friendly. 4-6 = average. 7-9 = concerning. 10 = extremely harmful.`;

async function analyzeWithGroq(text) {
  const truncated = text.substring(0, 12000);
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: truncated },
      ],
      temperature: 0.3,
      max_completion_tokens: 2000,
    }),
  });
  const data = await res.json();
  let raw = data.choices?.[0]?.message?.content || "";
  // Sanitize
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
  raw = raw.replace(/"score"\s*:\s*"(\d+)"/g, '"score": $1');
  raw = raw.replace(/"score"\s*:\s*"[^"]*"/g, '"score": 0');
  raw = raw.replace(/"score"\s*:\s*null/g, '"score": 0');
  return JSON.parse(raw.trim());
}

async function fetchPolicyText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PolicyPlain/1.0)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, iframe, noscript").remove();
  return $('main, article, .content, .policy, [role="main"], body')
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

async function crawl() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log("🕷️  PolicyPlain Crawler starting...\n");

  try {
    const policies = await pool.query(
      `SELECT p.id, p.source_url, p.policy_type, c.name as company_name, c.id as company_id
       FROM policies p JOIN companies c ON c.id = p.company_id
       WHERE p.is_active = true`,
    );

    console.log(`Found ${policies.rows.length} active policies to check.\n`);

    for (const policy of policies.rows) {
      console.log(`📄 ${policy.company_name} — ${policy.policy_type}`);
      try {
        const text = await fetchPolicyText(policy.source_url);
        if (!text || text.length < 100) {
          console.log("   ⚠️  Insufficient text extracted, skipping");
          await pool.query(
            `INSERT INTO crawl_log (policy_id, status, error_message, new_version_created)
             VALUES ($1, 'failed', 'Insufficient text', false)`,
            [policy.id],
          );
          continue;
        }

        const hash = crypto.createHash("sha256").update(text).digest("hex");
        const existing = await pool.query(
          "SELECT content_hash FROM policy_versions WHERE policy_id = $1 AND is_current = true",
          [policy.id],
        );

        if (
          existing.rows.length > 0 &&
          existing.rows[0].content_hash === hash
        ) {
          console.log("   ✓ Unchanged");
          await pool.query(
            `INSERT INTO crawl_log (policy_id, status, new_version_created) VALUES ($1, 'unchanged', false)`,
            [policy.id],
          );
          continue;
        }

        console.log("   🔄 Change detected, analyzing...");
        const analysis = await analyzeWithGroq(text);

        const versionRes = await pool.query(
          "SELECT COALESCE(MAX(version_number), 0) + 1 as next FROM policy_versions WHERE policy_id = $1",
          [policy.id],
        );
        const nextVersion = versionRes.rows[0].next;

        await pool.query(
          "UPDATE policy_versions SET is_current = false WHERE policy_id = $1 AND is_current = true",
          [policy.id],
        );

        const rb = analysis.risk_breakdown || {};
        const cat = analysis.categories || {};
        await pool.query(
          `INSERT INTO policy_versions (
            policy_id, version_number, content_hash, raw_text, is_current,
            overall_summary, risk_level, risk_summary,
            score_data_privacy, score_user_rights, score_billing, score_legal_exposure,
            note_data_privacy, note_user_rights, note_billing, note_legal_exposure,
            data_collected, data_sharing, your_rights, what_you_give_up, billing, risk_flags
          ) VALUES ($1,$2,$3,$4,true,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
          [
            policy.id,
            nextVersion,
            hash,
            text,
            analysis.overall_summary || "",
            analysis.risk_level || "medium",
            analysis.risk_summary || "",
            rb.data_privacy?.score || 0,
            rb.user_rights?.score || 0,
            rb.billing?.score || 0,
            rb.legal_exposure?.score || 0,
            rb.data_privacy?.note || "",
            rb.user_rights?.note || "",
            rb.billing?.note || "",
            rb.legal_exposure?.note || "",
            JSON.stringify(cat.data_collected || []),
            JSON.stringify(cat.data_sharing || []),
            JSON.stringify(cat.your_rights || []),
            JSON.stringify(cat.what_you_give_up || []),
            JSON.stringify(cat.billing || []),
            JSON.stringify(cat.risk_flags || []),
          ],
        );

        // Update company score
        const scoreRes = await pool.query(
          `SELECT AVG((pv.score_data_privacy + pv.score_user_rights + pv.score_billing + pv.score_legal_exposure) / 4.0) as avg
           FROM policy_versions pv JOIN policies p ON p.id = pv.policy_id
           WHERE p.company_id = $1 AND pv.is_current = true`,
          [policy.company_id],
        );
        await pool.query(
          "UPDATE companies SET overall_score = $1, updated_at = NOW() WHERE id = $2",
          [
            Math.round((scoreRes.rows[0].avg || 5) * 10) / 10,
            policy.company_id,
          ],
        );

        await pool.query(
          `INSERT INTO crawl_log (policy_id, status, new_version_created) VALUES ($1, 'success', true)`,
          [policy.id],
        );
        console.log(`   ✅ Version ${nextVersion} saved`);

        // Rate limit: wait 2 seconds between API calls
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        await pool.query(
          `INSERT INTO crawl_log (policy_id, status, error_message, new_version_created)
           VALUES ($1, 'failed', $2, false)`,
          [policy.id, err.message],
        );
      }
    }

    console.log("\n🏁 Crawl complete!");
  } finally {
    await pool.end();
  }
}

crawl().catch(console.error);
