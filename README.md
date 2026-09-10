# SMART INDIA HACKATHON 2026

## Problem Statement ID: 26056
**Problem Statement Title:** Development of a Real-time Airfare Price Index for India through Automated Web Scraping of Airline and Online Travel Aggregator Portals for Augmentation of the Consumer Price Index (CPI)  
**Theme:** Smart Automation  
**Category:** Software  
**Team Name:** AndroMatrix  

---

## Executive Summary

The **AndroMatrix APIx Platform** is an end-to-end macroeconomic analytics and automated data ingestion system developed for the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Reserve Bank of India (RBI)**.

Traditional airfare sampling in India's Consumer Price Index (CPI Base 2012=100) suffers from severe latency, sampling bias, and dynamic pricing distortions. AndroMatrix modernizes this framework by combining high-frequency headless browser scraping, a synthetic constant-horizon booking basket, deterministic fare decomposition, and a rigorous two-tier mathematical formulation compliant with international statistical standards (IMF CPI Manual 2020).

---

## Why Traditional CPI Airfare Sampling Fails & How AndroMatrix APIx Modernizes It

```
┌─────────────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────────────┐
│              Current MoSPI Pain Points                  │   │               The AndroMatrix APIx Solution             │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 1. 42-Day Data Lag                                      │   │ 1. High-Frequency Automated Ingestion                   │
│    Manual monthly/quarterly field collection fails to   │──▶│    Requests top 15 domestic routes every 6 hours across │
│    capture intra-day dynamic surge pricing.             │   │    domestic carriers (IndiGo, Air India, Akasa Air).    │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 2. Advance-Purchase Blindness                           │   │ 2. Synthetic Constant-Horizon Basket                    │
│    Flight booked for tomorrow (T+1) vs 45 days away     │──▶│    Tracks discrete horizons (T+1, T+7, T+15, T+30,      │
│    (T+45) differs by 300%-400% in price.                │   │    T+45) to maintain consistent matched-model pricing.  │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 3. Route Misrepresentation                              │   │ 3. DGCA Passenger Traffic Weighting                     │
│    High-density trunk routes (DEL-BOM) and small UDAN   │──▶│    Dynamically incorporates official DGCA city-pair     │
│    routes averaged together without traffic weights.    │   │    quarterly datasets for route weighting shares (w_r). │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 4. Ancillary Noise Pollution                            │   │ 4. Deterministic Fare Decomposition                     │
│    Voluntary add-ons (meals, seat selection, baggage)   │──▶│    Robust regex/API payload validation isolating        │
│    distort pure transport inflation.                    │   │    Base Fare + Fuel Surcharge + Airport Tax (UDF).      │
└─────────────────────────────────────────────────────────┘   └─────────────────────────────────────────────────────────┘
```

---

## Two-Tier Formula Basket

Compliant with the **IMF CPI Manual (2020, Chapter 10: Scanner & Web-Scraped Data)** and ILO recommendations:

### 1. Micro-Index: Jevons Elementary Geometric Mean
At the elementary route and advance-purchase horizon level, price relatives are aggregated geometrically without requiring continuous intraday passenger quantity weights:

$$I_J(t/0) = \left( \prod_{i=1}^n \frac{P_i(t)}{P_i(0)} \right)^{\frac{1}{n}} = \exp\left( \frac{1}{n} \sum_{i=1}^n \ln \frac{P_i(t)}{P_i(0)} \right)$$

* **Why Jevons?**
  * Satisfies the multi-lateral **time reversal test** ($I(t/0) \cdot I(0/t) = 1$) and **circularity/transitivity test**.
  * Eliminates the severe upward substitution bias inherent in the arithmetic Carli formula when applied to volatile dynamic airfares.

### 2. Macro APIx: DGCA Passenger Traffic-Weighted Aggregate
The national composite Airfare Price Index is computed by weighting each route's micro-index using quarterly passenger traffic volume shares published by the Directorate General of Civil Aviation (DGCA):

$$\text{Macro APIx} = \sum_{r} w_r \cdot I_r(t/0)$$

$$\text{where } w_r = \frac{\text{Passenger Traffic}_r}{\sum_k \text{Passenger Traffic}_k}$$

---

## Technical Architecture & Methodology

### 1. Frontend & Visualization (`/frontend`)
* **Framework:** React 19, Vite 8, TypeScript
* **Styling:** Tailwind CSS v4, Shadcn UI design tokens
* **Data Visualization:** Recharts (30-Day APIx Trend, Lead-Time Elasticity, DGCA Sector Comparison, Fare Breakdown Donut)
* **Icons:** Lucide React
* **Key Features:**
  * Interactive Jevons Formula Tooltip & Popover with IMF CPI citations.
  * Real-Time Scraper Audit & Provenance Log with SHA-256 verification.
  * Advance purchase elasticity modeling ($T+1$ to $T+45$).

### 2. Backend & Database API (`/backend`)
* **Runtime & Framework:** Node.js, Express REST API
* **Database ORM:** Prisma ORM connected to PostgreSQL (NeonDB)
* **API Endpoints:**
  * `GET /api/v1/analytics/trend`: 30-day APIx vs Baseline inflation time-series.
  * `GET /api/v1/analytics/elasticity`: Advance-purchase horizon pricing data.
  * `GET /api/v1/logs`: Immutable scrape records with timestamps and fare decomposition.

### 3. Web Scraper & Ingestion Engine (`/scraper`)
* **Engine:** Python 3.10+, Playwright Stealth
* **Data Pipeline:** Pandas, Pydantic, FastAPI
* **Data Cleaning:** 7-phase validation pipeline stripping ancillary add-ons, imputing sold-out flights, and filtering dynamic surge outliers using Interquartile Range (IQR).

---

## Feasibility, Anti-Bot Engineering & Risk Mitigation

| Challenge / Risk | Real-World Operational Threat | AndroMatrix Production Countermeasure |
| :--- | :--- | :--- |
| **Anti-Bot Defenses & IP Bans** | Cloudflare Turnstile, Akamai Bot Manager, rate limits. | Playwright stealth patches, TLS fingerprint spoofing, browser header emulation, residential proxy pool with exponential backoff. |
| **Website Structure Drift** | Frequent frontend updates break HTML/DOM XPath selectors. | Intercepts underlying XHR/REST JSON responses instead of fragile DOM scraping; fallback regex heuristic parser. |
| **Dynamic Surge Volatility** | Hourly flash sales or public holiday spikes skew monthly inflation index. | Multi-sample 24-hour trimmed geometric averaging per horizon; baseline reference index with IQR outlier suppression. |
| **Legal & Fair-Use Policy** | Terms of service limits and server capacity concerns. | Collects unauthenticated, publicly displayed consumer prices only; polite crawling rates, off-peak query schedules. |
| **Audit & Integrity** | Data tampering or pipeline silent failure. | **Immutable Cryptographic Audit:** Every scrape is logged with a SHA-256 hash for provenance and MoSPI compliance. |

---

## Monorepo Project Structure

```
APIx_Tracker/
├── README.md                          # Comprehensive Hackathon Documentation
├── .gitignore                         # Root Git configuration
│
├── frontend/                          # React + TypeScript + Vite Dashboard
│   ├── src/
│   │   ├── App.tsx                    # Main APIx Analytics Dashboard
│   │   ├── main.tsx                   # React 19 entry point
│   │   ├── index.css                  # Tailwind CSS v4 design tokens
│   │   ├── components/ui/button.tsx   # Shadcn Button component
│   │   └── lib/utils.ts               # Class merging utilities (clsx/tailwind-merge)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                           # Node.js + Express REST API
│   ├── server.js                      # Express server entry point
│   ├── prisma/
│   │   └── schema.prisma              # NeonDB PostgreSQL schema (DailyIndex, ScrapeLog)
│   ├── src/
│   │   ├── controllers/               # Analytics & Logs controllers
│   │   └── routes/                    # API route definitions
│   └── package.json
│
└── scraper/                           # Python Playwright Automated Ingestion
    └── README.md
```

---

## Quick Start & Setup Instructions

### Prerequisites
* **Node.js:** v18 or later
* **npm:** v9 or later
* **Python:** 3.10 or later
* **PostgreSQL Database:** NeonDB or local instance

### 1. Backend Setup
```bash
cd backend
npm install

# Configure your environment variables
cp .env.example .env
# Set DATABASE_URL="postgresql://username:password@ep-host.neon.tech/neondb" in .env

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start the backend server
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Production Build Verification
```bash
cd frontend
npm run build
```

---

## References & Statistical Standards

1. **National Statistical Standards:**
   * MoSPI CPI Manual (Base 2012=100) – Transport subgroup specifications.
   * MoSPI Modernization Committee (2020) – Integrating web scraping into national statistics.
   * National Data Governance Framework (NDGF) – Standards for automated data pipelines.
2. **International Economic Frameworks:**
   * IMF CPI Manual (2020, Chapter 10) – Scanner & web-scraped data with Jevons micro-indexes.
   * ILO & United Nations CPI Guide – Advance purchase horizons & dynamic pricing rules.
   * Eurostat & UK ONS – Multilateral airfare index construction & quality adjustment.
3. **Aviation & Open Data Standards:**
   * DGCA Domestic Traffic Reports – Quarterly city-pair statistics for formula weights ($w_r$).
   * IATA Economics – Airline yield management, dynamic surge, and fuel-pass-through elasticity.

---

### Team AndroMatrix · Smart India Hackathon 2026
*Empowering MoSPI and RBI with high-frequency, tamper-evident transport inflation intelligence.*
