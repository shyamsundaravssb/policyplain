# PolicyPlain

**Legal policies in plain English.** A public, searchable web directory that simplifies legal terms of service and privacy policies into plain English — scored, tracked, and automatically updated.

---

## The Problem

- Users blindly agree to policies they don't understand
- Policies change silently without notifying users
- There is no single trustworthy public record of what companies' policies actually mean
- There is no accountability system that ranks companies on how fairly they treat users

**PolicyPlain fixes all four.**

---

## Features

### 🔍 One URL Per Policy, Forever

Every company gets a permanent URL (e.g., `/google/privacy`) that always shows the latest simplified analysis. Old versions are archived, never deleted.

### 🤖 AI-Powered Analysis

Every policy is analyzed by AI (Groq — Llama 4 Scout) to produce:

- A plain English summary
- Risk scores across 4 dimensions (Data Privacy, User Rights, Billing, Legal Exposure)
- Categorized breakdowns (data collected, data sharing, your rights, what you give up, red flags)

### 📊 Company Rankings

All indexed companies ranked by policy fairness on a 0–10 scale. Lower = better. Companies cannot pay to improve their score.

### 📜 Version History

Every change is tracked. See exactly what changed, when, and how the risk profile evolved over time.

### 🔎 Instant Search

Fuzzy search with `pg_trgm` — find any company instantly, even with typos.

### 🧩 Browser Extension API

Dedicated `/api/extension/analyze` endpoint for browser extensions to submit and analyze policies directly from any website.

### 🕷️ Automated Crawler

Background crawler that re-checks every indexed policy, detects changes via content hashing, and triggers re-analysis automatically.

---

## Tech Stack

| Layer         | Technology                                  |
| ------------- | ------------------------------------------- |
| **Framework** | Next.js 16 (App Router, TypeScript)         |
| **Styling**   | Tailwind CSS + Custom CSS design system     |
| **Database**  | PostgreSQL with `pg_trgm` extension         |
| **AI**        | Groq API (Llama 4 Scout 17B)                |
| **Scraping**  | Cheerio                                     |
| **Auth**      | API key authentication (extension endpoint) |

---

## Project Structure

```
policyplain/
├── scripts/
│   ├── setup-db.js          # Database schema setup
│   ├── seed.js               # Seed 20 companies with real policy URLs
│   └── crawler.js            # Background crawler for policy updates
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout (nav, footer)
│   │   ├── globals.css        # Dark theme design system
│   │   ├── about/page.tsx     # About & methodology
│   │   ├── rankings/page.tsx  # Company rankings
│   │   ├── search/page.tsx    # Search results + submit form
│   │   ├── [slug]/page.tsx    # Company detail page
│   │   ├── [slug]/[policyType]/history/page.tsx  # Version history
│   │   └── api/
│   │       ├── health/              # GET  — Health check
│   │       ├── companies/           # GET  — List all companies
│   │       ├── companies/[slug]/    # GET  — Company details + policies
│   │       ├── companies/[slug]/[policyType]/         # GET  — Latest analysis
│   │       ├── companies/[slug]/[policyType]/history/ # GET  — Version history
│   │       ├── search/              # GET  — Fuzzy search
│   │       ├── rankings/            # GET  — Ranked companies + categories
│   │       ├── stats/               # GET  — Index statistics
│   │       ├── submit/              # POST — Submit new policy URL
│   │       ├── analyze/             # POST — Internal analysis trigger
│   │       └── extension/analyze/   # POST — Extension endpoint (auth required)
│   ├── components/
│   │   ├── ScoreGauge.tsx     # Circular score visualization
│   │   ├── ScoreBar.tsx       # Horizontal score bar
│   │   ├── RiskBadge.tsx      # Low/Medium/High risk pill
│   │   ├── CompanyCard.tsx    # Company grid card
│   │   ├── CompanyLogo.tsx    # Logo with 3-tier fallback
│   │   ├── SearchBar.tsx      # Instant search with suggestions
│   │   ├── CategoryBreakdown.tsx  # Policy category card
│   │   └── RecentlyUpdatedList.tsx # Recently updated companies
│   └── lib/
│       ├── db.ts              # PostgreSQL connection pool
│       ├── schema.sql         # Full database schema
│       └── analyzer.ts        # Groq AI integration
└── .env.local                 # Environment variables
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ (with pgAdmin or CLI)
- **Groq API Key** — Get one at [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
git clone <repo-url>
cd policyplain
npm install
```

### 2. Configure Environment

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/policyplain_db

# Groq API
GROQ_API_KEY=your_groq_api_key_here

# Extension API Key (generate your own UUID)
EXTENSION_API_KEY=your-random-api-key-here
```

### 3. Set Up Database

Create the database in pgAdmin (or CLI):

```sql
CREATE DATABASE policyplain_db;
```

Then run the schema and seed scripts:

```bash
node scripts/setup-db.js    # Creates tables, indexes, and extensions
node scripts/seed.js         # Seeds 20 companies with real policy URLs
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the homepage with seeded companies.

### 5. (Optional) Populate with AI Analysis

Run the crawler to fetch and analyze all seeded policies:

```bash
node scripts/crawler.js
```

> ⚠️ This makes ~40 Groq API calls (2 policies × 20 companies). Takes ~2 minutes. The crawler includes a 2-second delay between calls for rate limiting.

---

## Scoring Methodology

Every policy is scored on a **0 to 10 scale** across four dimensions:

| Score Range | Label            | Meaning                        |
| ----------- | ---------------- | ------------------------------ |
| **0–3**     | 🟢 User Friendly | Policy respects user rights    |
| **4–6**     | 🟡 Average       | Standard industry practices    |
| **7–9**     | 🔴 Concerning    | Significant user rights issues |
| **10**      | ⛔ Harmful       | Actively harmful to users      |

**Dimensions scored:**

- **Data Privacy** — What data is collected and how it's used
- **User Rights** — What rights you retain or give up
- **Billing & Payments** — Auto-renewals, hidden fees, cancellation
- **Legal Exposure** — Arbitration clauses, liability limits, jurisdiction

The company's **overall score** is the average across all analyzed policies.

---

## API Reference

### Public Endpoints

| Method | Endpoint                                 | Description                |
| ------ | ---------------------------------------- | -------------------------- |
| `GET`  | `/api/health`                            | Health check               |
| `GET`  | `/api/companies`                         | List all companies         |
| `GET`  | `/api/companies/:slug`                   | Company details + policies |
| `GET`  | `/api/companies/:slug/:type`             | Latest policy analysis     |
| `GET`  | `/api/companies/:slug/:type/history`     | Policy version history     |
| `GET`  | `/api/search?q=query`                    | Fuzzy search companies     |
| `GET`  | `/api/rankings?sort=worst&category=Tech` | Ranked companies           |
| `GET`  | `/api/rankings?categories=true`          | List all categories        |
| `GET`  | `/api/stats`                             | Index statistics           |
| `POST` | `/api/submit`                            | Submit a new policy URL    |

### Extension Endpoint (Auth Required)

| Method | Endpoint                 | Auth Header                 |
| ------ | ------------------------ | --------------------------- |
| `POST` | `/api/extension/analyze` | `x-extension-key: YOUR_KEY` |

**Request body:**

```json
{
  "url": "https://example.com/privacy",
  "title": "Example - Privacy Policy",
  "text": "extracted policy text..."
}
```

**Response:**

```json
{
  "success": true,
  "isNew": true,
  "companySlug": "example",
  "policyType": "privacy",
  "permanentUrl": "http://localhost:3000/example/privacy",
  "versionNumber": 1,
  "analysis": { ... }
}
```

---

## Database Schema

- **companies** — Company name, slug, website, category, overall score
- **policies** — Policy type, source URL, linked to company
- **policy_versions** — Full analysis per version (scores, summaries, categories), content hash, version number
- **crawl_log** — Crawl status per policy (success, unchanged, failed)

The `pg_trgm` extension enables fuzzy search with similarity scoring.

---

## Design

Dark editorial theme inspired by data journalism, featuring:

- **Fonts**: Playfair Display (headings) + JetBrains Mono (data) + Inter (body)
- **Colors**: Dark background with green/yellow/red accent system
- **Components**: Gradient score gauges with glow effects, glassmorphic nav, animated cards
- **Responsive**: Mobile-first with adaptive grids

---

## Legal Disclaimer

PolicyPlain provides AI-generated summaries for **informational purposes only**. Nothing on this site constitutes legal advice. Always read the original policy and consult a legal professional for decisions that affect your rights.

---

## License

MIT
