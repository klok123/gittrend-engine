# GitTrend — Production-Grade GitHub Repository Discovery & Trend Intelligence

A high-performance, privacy-compliant GitHub repository discovery and trend-intelligence engine designed for $0 initial creator cost. Tracks fast-growing open source repositories, breakout developer tools, and hidden gems ranked by empirical star-velocity momentum.

---

## ⚡ Key Highlights

- **$0 Creator Cost**: Fully functional within free-tier limits of Vercel Edge Hosting, GitHub Actions, GitHub API (PAT/Token), and Neon PostgreSQL.
- **Mathematical Momentum-Log Ranking**: Uses a non-linear velocity model `(Δ Stars)² / ln(Total Stars + 10)` to spotlight organic breakout projects without favoring established mega-repositories.
- **Evidence-Based Anomaly Scoring**: Detects and suppresses bot-farmed spikes and artificial surges via multi-vector heuristics (velocity spurt, fork disparity, account age, commit dormancy).
- **Zero Hallucination / True Delta Architecture**: Calculates real historical differentials from relational daily snapshots; no randomized data.
- **Sub-50ms Global Edge Delivery**: Precomputed static summaries for blazing-fast edge loads, with live database fallback capabilities.

---

## 🏗️ Architecture Overview

```
GitHub GraphQL / REST Ingestion
              │
              ▼
   Rate Governor & Backoff
              │
              ▼
  Relational Snapshot Persistence (PostgreSQL)
              │
              ▼
   Ranking & Anomaly Engine
              │
              ▼
  Precomputed Static Edge JSON & Dynamic APIs
              │
              ▼
  Next.js 16 App Router UI (Edge-Prerendered)
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/your-org/clever-volta.git
cd clever-volta
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your credentials:
```env
# Optional: Personal Access Token for GitHub API ingestion (5000 pts/hr)
GITHUB_TOKEN="ghp_your_github_token"

# Optional: Neon or Supabase connection string for persistent historical snapshots
DATABASE_URL="postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require"

# Base URL for metadata and XML feeds
NEXT_PUBLIC_SITE_URL="https://gittrend-engine.vercel.app"
```

### 3. Database Migrations (Optional)
If using PostgreSQL for snapshot persistence:
```bash
npm run migrate
```

### 4. Running the ETL Pipeline
```bash
npm run etl
```

### 5. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation

Run the automated mathematical invariant and test suite:
```bash
npm test
```

Run the production build:
```bash
npm run build
```

---

## 📜 License
MIT License. Unaffiliated with GitHub Inc.
