/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const companies = [
  {
    name: "Google",
    slug: "google",
    website: "https://google.com",
    category: "Technology",
    logo_url: "https://logo.clearbit.com/google.com",
    policies: [
      { type: "privacy", url: "https://policies.google.com/privacy" },
      { type: "terms", url: "https://policies.google.com/terms" },
    ],
  },
  {
    name: "Meta (Facebook)",
    slug: "facebook",
    website: "https://facebook.com",
    category: "Social Media",
    logo_url: "https://logo.clearbit.com/facebook.com",
    policies: [
      { type: "privacy", url: "https://www.facebook.com/privacy/policy/" },
      { type: "terms", url: "https://www.facebook.com/legal/terms" },
    ],
  },
  {
    name: "Instagram",
    slug: "instagram",
    website: "https://instagram.com",
    category: "Social Media",
    logo_url: "https://logo.clearbit.com/instagram.com",
    policies: [
      { type: "privacy", url: "https://privacycenter.instagram.com/policy" },
      { type: "terms", url: "https://help.instagram.com/581066165581870" },
    ],
  },
  {
    name: "WhatsApp",
    slug: "whatsapp",
    website: "https://whatsapp.com",
    category: "Messaging",
    logo_url: "https://logo.clearbit.com/whatsapp.com",
    policies: [
      { type: "privacy", url: "https://www.whatsapp.com/legal/privacy-policy" },
      { type: "terms", url: "https://www.whatsapp.com/legal/terms-of-service" },
    ],
  },
  {
    name: "X (Twitter)",
    slug: "twitter",
    website: "https://x.com",
    category: "Social Media",
    logo_url: "https://logo.clearbit.com/x.com",
    policies: [
      { type: "privacy", url: "https://twitter.com/en/privacy" },
      { type: "terms", url: "https://twitter.com/en/tos" },
    ],
  },
  {
    name: "TikTok",
    slug: "tiktok",
    website: "https://tiktok.com",
    category: "Social Media",
    logo_url: "https://logo.clearbit.com/tiktok.com",
    policies: [
      {
        type: "privacy",
        url: "https://www.tiktok.com/legal/privacy-policy-us",
      },
      {
        type: "terms",
        url: "https://www.tiktok.com/legal/terms-of-service-us",
      },
    ],
  },
  {
    name: "Spotify",
    slug: "spotify",
    website: "https://spotify.com",
    category: "Entertainment",
    logo_url: "https://logo.clearbit.com/spotify.com",
    policies: [
      {
        type: "privacy",
        url: "https://www.spotify.com/us/legal/privacy-policy/",
      },
      {
        type: "terms",
        url: "https://www.spotify.com/us/legal/end-user-agreement/",
      },
    ],
  },
  {
    name: "Apple",
    slug: "apple",
    website: "https://apple.com",
    category: "Technology",
    logo_url: "https://logo.clearbit.com/apple.com",
    policies: [
      { type: "privacy", url: "https://www.apple.com/legal/privacy/" },
      {
        type: "terms",
        url: "https://www.apple.com/legal/internet-services/itunes/",
      },
    ],
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    website: "https://microsoft.com",
    category: "Technology",
    logo_url: "https://logo.clearbit.com/microsoft.com",
    policies: [
      {
        type: "privacy",
        url: "https://privacy.microsoft.com/en-us/privacystatement",
      },
      {
        type: "terms",
        url: "https://www.microsoft.com/en-us/servicesagreement",
      },
    ],
  },
  {
    name: "Amazon",
    slug: "amazon",
    website: "https://amazon.com",
    category: "E-Commerce",
    logo_url: "https://logo.clearbit.com/amazon.com",
    policies: [
      {
        type: "privacy",
        url: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ",
      },
      {
        type: "terms",
        url: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GLSBYFE9HOGB6C6D",
      },
    ],
  },
  {
    name: "YouTube",
    slug: "youtube",
    website: "https://youtube.com",
    category: "Entertainment",
    logo_url: "https://logo.clearbit.com/youtube.com",
    policies: [
      { type: "privacy", url: "https://policies.google.com/privacy" },
      { type: "terms", url: "https://www.youtube.com/static?template=terms" },
    ],
  },
  {
    name: "LinkedIn",
    slug: "linkedin",
    website: "https://linkedin.com",
    category: "Professional",
    logo_url: "https://logo.clearbit.com/linkedin.com",
    policies: [
      { type: "privacy", url: "https://www.linkedin.com/legal/privacy-policy" },
      { type: "terms", url: "https://www.linkedin.com/legal/user-agreement" },
    ],
  },
  {
    name: "Snapchat",
    slug: "snapchat",
    website: "https://snapchat.com",
    category: "Social Media",
    logo_url: "https://logo.clearbit.com/snapchat.com",
    policies: [
      { type: "privacy", url: "https://snap.com/en-US/privacy/privacy-policy" },
      { type: "terms", url: "https://snap.com/en-US/terms" },
    ],
  },
  {
    name: "Reddit",
    slug: "reddit",
    website: "https://reddit.com",
    category: "Social Media",
    logo_url: "https://logo.clearbit.com/reddit.com",
    policies: [
      {
        type: "privacy",
        url: "https://www.reddit.com/policies/privacy-policy",
      },
      {
        type: "terms",
        url: "https://www.redditinc.com/policies/user-agreement",
      },
    ],
  },
  {
    name: "Netflix",
    slug: "netflix",
    website: "https://netflix.com",
    category: "Entertainment",
    logo_url: "https://logo.clearbit.com/netflix.com",
    policies: [
      { type: "privacy", url: "https://help.netflix.com/legal/privacy" },
      { type: "terms", url: "https://help.netflix.com/legal/termsofuse" },
    ],
  },
  {
    name: "Uber",
    slug: "uber",
    website: "https://uber.com",
    category: "Transportation",
    logo_url: "https://logo.clearbit.com/uber.com",
    policies: [
      {
        type: "privacy",
        url: "https://www.uber.com/legal/en/document/?name=privacy-notice",
      },
      {
        type: "terms",
        url: "https://www.uber.com/legal/en/document/?name=general-terms-of-use",
      },
    ],
  },
  {
    name: "Airbnb",
    slug: "airbnb",
    website: "https://airbnb.com",
    category: "Travel",
    logo_url: "https://logo.clearbit.com/airbnb.com",
    policies: [
      { type: "privacy", url: "https://www.airbnb.com/help/article/2855" },
      { type: "terms", url: "https://www.airbnb.com/help/article/2908" },
    ],
  },
  {
    name: "PayPal",
    slug: "paypal",
    website: "https://paypal.com",
    category: "Finance",
    logo_url: "https://logo.clearbit.com/paypal.com",
    policies: [
      {
        type: "privacy",
        url: "https://www.paypal.com/us/legalhub/privacy-full",
      },
      {
        type: "terms",
        url: "https://www.paypal.com/us/legalhub/useragreement-full",
      },
    ],
  },
  {
    name: "Zoom",
    slug: "zoom",
    website: "https://zoom.us",
    category: "Productivity",
    logo_url: "https://logo.clearbit.com/zoom.us",
    policies: [
      { type: "privacy", url: "https://explore.zoom.us/en/privacy/" },
      { type: "terms", url: "https://explore.zoom.us/en/terms/" },
    ],
  },
  {
    name: "Duolingo",
    slug: "duolingo",
    website: "https://duolingo.com",
    category: "Education",
    logo_url: "https://logo.clearbit.com/duolingo.com",
    policies: [
      { type: "privacy", url: "https://www.duolingo.com/privacy" },
      { type: "terms", url: "https://www.duolingo.com/terms" },
    ],
  },
];

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🌱 Seeding database...");

    for (const company of companies) {
      // Insert company
      const companyResult = await pool.query(
        `INSERT INTO companies (name, slug, logo_url, website, category, overall_score)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET name = $1, logo_url = $3, website = $4, category = $5
         RETURNING id`,
        [
          company.name,
          company.slug,
          company.logo_url,
          company.website,
          company.category,
          5.0,
        ],
      );

      const companyId = companyResult.rows[0].id;

      // Insert policies
      for (const policy of company.policies) {
        await pool.query(
          `INSERT INTO policies (company_id, policy_type, source_url, slug, is_active)
           VALUES ($1, $2, $3, $4, true)
           ON CONFLICT (company_id, policy_type) DO UPDATE SET source_url = $3`,
          [companyId, policy.type, policy.url, policy.type],
        );
      }

      console.log(`  ✅ ${company.name}`);
    }

    console.log(
      `\n🎉 Seeded ${companies.length} companies with ${companies.reduce((acc, c) => acc + c.policies.length, 0)} policies!`,
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
