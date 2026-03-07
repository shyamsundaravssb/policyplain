import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a policy analysis expert who helps everyday users understand what they are agreeing to. Read the given policy text and return a structured JSON analysis.

Return ONLY valid JSON. No markdown. No backticks. No preamble. Every score field MUST be an integer between 0 and 10. Never use text like N/A for scores — use 0 if not applicable.

{
  "site_name": "Company name",
  "company_category": "One of: Technology, Social Media, Entertainment, E-Commerce, Finance, Productivity, Messaging, Professional, Transportation, Travel, Education, Healthcare, Gaming, Food & Delivery, or Other",
  "policy_type": "Privacy Policy or Terms of Service etc",
  "overall_summary": "3-4 sentences. Be SPECIFIC. Name actual data types collected, actual third parties mentioned, actual rights the user gains or loses. Write as if explaining to a smart friend who asked what does this actually mean for me?",
  "risk_level": "low or medium or high",
  "risk_breakdown": {
    "data_privacy":   { "score": 5, "note": "one specific sentence about data practices in this policy" },
    "user_rights":    { "score": 5, "note": "one specific sentence about what rights the user retains or loses" },
    "billing":        { "score": 0, "note": "one sentence about billing, or Not applicable if no billing mentioned" },
    "legal_exposure": { "score": 5, "note": "one sentence about arbitration clauses, liability limits, jurisdiction" }
  },
  "risk_summary": "2 sentences explaining the risk level with specific evidence from this policy",
  "categories": {
    "data_collected":   ["specific point naming actual data types"],
    "data_sharing":     ["specific point naming actual third parties or partner types"],
    "your_rights":      ["specific right the user has e.g. can request data deletion within 30 days"],
    "what_you_give_up": ["specific right the user gives up e.g. perpetual royalty-free license on content"],
    "billing":          [],
    "risk_flags":       ["specific alarming clause e.g. terms can change without notice"]
  }
}

For company_category, determine the company's primary industry from the policy content. Use one of: Technology, Social Media, Entertainment, E-Commerce, Finance, Productivity, Messaging, Professional, Transportation, Travel, Education, Healthcare, Gaming, Food & Delivery. Only use Other if none of these categories fit.

Scoring: 0-3 = user-friendly. 4-6 = average. 7-9 = concerning. 10 = extremely harmful to users.`;

export interface AnalysisResult {
  site_name: string;
  company_category: string;
  policy_type: string;
  overall_summary: string;
  risk_level: "low" | "medium" | "high";
  risk_breakdown: {
    data_privacy: { score: number; note: string };
    user_rights: { score: number; note: string };
    billing: { score: number; note: string };
    legal_exposure: { score: number; note: string };
  };
  risk_summary: string;
  categories: {
    data_collected: string[];
    data_sharing: string[];
    your_rights: string[];
    what_you_give_up: string[];
    billing: string[];
    risk_flags: string[];
  };
}

function sanitizeResponse(text: string): string {
  // Strip markdown code fences
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
  // Fix string scores: "score": "5" → "score": 5
  cleaned = cleaned.replace(/"score"\s*:\s*"(\d+)"/g, '"score": $1');
  // Fix string scores that are not numbers: "score": "N/A" → "score": 0
  cleaned = cleaned.replace(/"score"\s*:\s*"[^"]*"/g, '"score": 0');
  // Fix null scores: "score": null → "score": 0
  cleaned = cleaned.replace(/"score"\s*:\s*null/g, '"score": 0');
  return cleaned.trim();
}

function ensureScore(val: unknown): number {
  if (typeof val === "number" && !isNaN(val)) {
    return Math.min(10, Math.max(0, Math.round(val)));
  }
  return 0;
}

export async function analyzePolicy(
  policyText: string,
): Promise<AnalysisResult> {
  const truncatedText = policyText.substring(0, 12000); // Limit input size

  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: truncatedText },
    ],
    temperature: 0.3,
    max_completion_tokens: 2000,
  });

  const rawResponse = completion.choices[0]?.message?.content || "";
  const sanitized = sanitizeResponse(rawResponse);

  try {
    const parsed = JSON.parse(sanitized);

    // Ensure all scores are valid integers
    if (parsed.risk_breakdown) {
      for (const key of [
        "data_privacy",
        "user_rights",
        "billing",
        "legal_exposure",
      ]) {
        if (parsed.risk_breakdown[key]) {
          parsed.risk_breakdown[key].score = ensureScore(
            parsed.risk_breakdown[key].score,
          );
        } else {
          parsed.risk_breakdown[key] = { score: 0, note: "Not analyzed" };
        }
      }
    }

    // Ensure risk_level is valid
    if (!["low", "medium", "high"].includes(parsed.risk_level)) {
      parsed.risk_level = "medium";
    }

    // Ensure categories are arrays
    const categoryDefaults = [
      "data_collected",
      "data_sharing",
      "your_rights",
      "what_you_give_up",
      "billing",
      "risk_flags",
    ];
    if (!parsed.categories) parsed.categories = {};
    for (const cat of categoryDefaults) {
      if (!Array.isArray(parsed.categories[cat])) {
        parsed.categories[cat] = [];
      }
    }

    // Ensure company_category is valid
    const validCategories = [
      "Technology",
      "Social Media",
      "Entertainment",
      "E-Commerce",
      "Finance",
      "Productivity",
      "Messaging",
      "Professional",
      "Transportation",
      "Travel",
      "Education",
      "Healthcare",
      "Gaming",
      "Food & Delivery",
      "Other",
    ];
    if (
      !parsed.company_category ||
      !validCategories.includes(parsed.company_category)
    ) {
      parsed.company_category = "Technology"; // sensible default
    }

    return parsed as AnalysisResult;
  } catch {
    throw new Error(
      `Failed to parse AI response: ${sanitized.substring(0, 200)}`,
    );
  }
}

export function computeOverallScore(analysis: AnalysisResult): number {
  const { data_privacy, user_rights, billing, legal_exposure } =
    analysis.risk_breakdown;
  const avg =
    (data_privacy.score +
      user_rights.score +
      billing.score +
      legal_exposure.score) /
    4;
  return Math.round(avg * 10) / 10;
}
