[LIVE LINK]([https://aviation-chat.vercel.app/])
# ✈ Aviation Crisis Intelligence Dashboard

An interactive full-stack data visualization dashboard tracking the financial and operational impact of global conflicts and oil price shocks on the aviation industry from 2019 to 2026. Features an AI-powered chat interface that filters every chart simultaneously using natural language.

![Status](https://img.shields.io/badge/Status-Live-52c97d?style=flat-square) ![Stack](https://img.shields.io/badge/Built%20with-D3.js%20%7C%20Groq%20%7C%20Vercel-3b9de8?style=flat-square) ![Data](https://img.shields.io/badge/Records-28%2C000%2B-e8a020?style=flat-square)

---

## Overview

This dashboard synthesizes six interconnected datasets across **25 major airlines**, **8 geopolitical conflict phases**, and **5 global regions** — showing how events like COVID-19, the Ukraine War, and the US-Iran conflict ripple through oil markets, airline profitability, ticket fares, fuel surcharges, and route operations.

The core idea: every geopolitical crisis leaves a measurable financial fingerprint on aviation. This dashboard makes that fingerprint visible and explorable in real time.

---

## Features

### 9 Interactive Charts

| Chart | Description |
|-------|-------------|
| **Crude & Jet Fuel Prices** | Monthly Brent, WTI, jet fuel, refinery margin, and OPEC output with conflict event markers overlaid on the timeline |
| **Conflict Events Log** | All 36 geopolitical events with severity ratings, oil shock magnitude, airfare impact %, and cancellation estimates — filterable and sortable |
| **Revenue · Fuel Cost · Profit** | Quarterly aggregate financials showing how fuel costs tracked against revenue and profit through each crisis |
| **Ticket Fares** | Average fares by route class across phases, with scatter (fare vs Brent correlation) and load factor views |
| **Airline Profit Margin Heatmap** | 16 airlines × 8 conflict phases — switchable between profit margin, fuel % of revenue, and hedge coverage |
| **Fuel Surcharges** | All four surcharge bands over time, switchable between USD and % of base fare |
| **Route Disruptions** | Cancelled and rerouted flights grouped by conflict phase, airline, or aircraft type |
| **Oil vs Profitability Scatter** | Brent crude vs profit margin, fuel %, or passenger volume with regression trend line |
| **Fuel Hedging Analysis** | Hedge savings and coverage % across phases and airlines |

### Filtering System

- **Global filter bar** — phase, region, and airline type filters update all charts simultaneously
- **Per-chart controls** — each chart has its own independent filters (event type, severity, sort order, metric toggle, etc.)
- **AI chat filter** — floating Messenger-style chat window powered by Groq Llama 3.3-70B; type natural language and every chart updates instantly

### AI Chat Examples

```
"Show me Middle East airlines during the Ukraine War"
"Filter to COVID collapse for Low Cost carriers only"
"Show military events sorted by oil price shock"
"Compare fuel hedging savings across all phases"
"Reset everything"
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS — zero framework dependencies |
| Visualizations | D3.js v7 |
| Backend | Vercel Serverless Functions (Node.js) |
| AI / NLP | Groq API — Llama 3.3-70B Versatile |
| Logging (optional) | N8n — query logging to Google Sheets + Slack alerts |
| Deployment | Vercel |

---

## Data

### Datasets (6 CSV files, 28,000+ records)

| File | Description | Records |
|------|-------------|---------|
| `oil_jet_fuel_prices.csv` | Monthly Brent, WTI, jet fuel prices, OPEC output, Hormuz disruption flags | 87 |
| `airline_financial_impact.csv` | Quarterly revenue, fuel cost, profit margin, hedging data per airline | 725 |
| `airline_ticket_prices.csv` | Monthly fares by airline, route class, and region | 14,355 |
| `fuel_surcharges.csv` | Monthly surcharges by band and airline | 10,092 |
| `conflict_oil_events.csv` | 36 geopolitical events with oil shock and airfare impact metrics | 36 |
| `route_cost_impact.csv` | Per-route rerouting, cancellation, and extra fuel cost data | 3,132 |

### Conflict Phases Covered

| Phase | Period |
|-------|--------|
| Pre-Pandemic Baseline | 2019 |
| COVID-19 Collapse | 2020 |
| Recovery & Surge | 2021 |
| Ukraine War Shock | 2022 |
| Stabilisation | 2022–2023 |
| Gaza-Israel Conflict | 2023 |
| Pre-Iran Escalation | 2024 |
| US-Iran War Conflict | 2025–2026 |

### Data Sources

EIA · Platts · IATA · Reuters · Bloomberg · Al Jazeera · S&P Global

---

## Project Structure

```
aviation-chat/
├── api/
│   └── chat.js          # Vercel serverless function — Groq API proxy
├── public/
│   └── index.html       # Full dashboard (single HTML file, data embedded)
├── vercel.json          # Routing config
└── package.json
```

---

## Deployment

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Vercel account](https://vercel.com) (free)
- [Groq API key](https://console.groq.com) (free)

### Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Clone the repo
git clone https://github.com/yourusername/aviation-chat.git
cd aviation-chat

# 3. Login to Vercel
vercel login

# 4. Deploy (press Enter for all defaults)
vercel

# 5. Add Groq API key to production
vercel env add GROQ_API_KEY
# → Select: Production
# → Value: paste your gsk_... key

# 6. Deploy to production
vercel --prod
```

Your live URL appears at the end. Open it — the AI chatbot works immediately, no further configuration needed.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | Groq API key — get one free at [console.groq.com](https://console.groq.com) → API Keys |
| `N8N_WEBHOOK_URL` | No | N8n webhook for query logging and Slack alerts |

---

## How the AI Chat Works

```
User types in chat bubble
        ↓
POST /api/chat  (same domain — zero CORS issues)
        ↓
Vercel Serverless Function
        ↓
Groq Llama 3.3-70B  (JSON mode, temperature 0.1)
        ↓
{ action, filters, explanation, insight }
        ↓
JS applies filters → all 9 charts re-render instantly
        ↓  (optional, fire-and-forget)
N8n → Google Sheets log → Slack alert
```

The Groq key lives in Vercel environment variables and never reaches the browser.

---

## N8n Workflow (Optional)

Import `n8n-workflow.json` into your N8n instance to enable:

- **Query logging** — every chat query logged to Google Sheets with applied filters, tokens used, and timestamp
- **Slack alerts** — triggered when users query conflict or war-related topics  
- **Weekly digest** — automated email summary of top queries, most-used filters, and token consumption every Monday 9am

---

## Local Development

Running the HTML file locally (`file://`) uses a built-in keyword-based fallback — handles queries like "middle east", "covid", "ukraine", "low cost", "military events" without needing the API.

For full AI locally:

```bash
# Runs both the static site and /api/chat locally
vercel dev
# → http://localhost:3000
```

Make sure `GROQ_API_KEY` is set in a `.env` file or via `vercel env pull`.

---

## Airlines Tracked (25)

Emirates · Qatar Airways · Etihad Airways · Singapore Airlines · British Airways · Air France · Lufthansa · Delta Air Lines · American Airlines · United Airlines · Turkish Airlines · Ryanair · Air India · Korean Air · Cathay Pacific · Japan Airlines · Air Arabia · EgyptAir · Ethiopian Airlines · Gulf Air · Kuwait Airways · Oman Air · Saudia · flydubai · flynas

---

## Built By

**Mehul Gupta** — Graduate Student, Management of Technology, NYU Tandon  
NYU Stern Volatility and Risk Institute (VRI) · Society for Financial Econometrics (SoFiE)

---

## License

MIT — free to use, modify, and distribute.
