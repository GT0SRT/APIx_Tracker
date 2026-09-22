# SMART INDIA HACKATHON 2026

## Problem Statement ID: SIH26056
**Problem Statement Title:** Development of a Real-time Airfare Price Index for India through Automated Web Scraping of Airline and Online Travel Aggregator Portals for Augmentation of the Consumer Price Index (CPI)  
**Theme:** Smart Automation  
**Category:** Software  
**Team Name:** AndroMatrix  

---

### 🌐 Quick Access & Demonstration
* 🚀 **Live Production Dashboard:** [https://apix-tracker.vercel.app/](https://apix-tracker.vercel.app/)
* 📂 **Official Submission Repository:** [https://github.com/GT0SRT/APIx_Tracker](https://github.com/GT0SRT/APIx_Tracker)

---

## Executive Summary

The **AndroMatrix APIx Platform** is India's first automated, real-time Airfare Price Index engine engineered for the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Reserve Bank of India (RBI)**.

Traditional airfare sampling in India's Consumer Price Index (CPI Base 2012=100 / 2024=100) relies on monthly manual field surveys, introducing a **45-day reporting lag**, advance-purchase blindness, and voluntary fee distortions. The APIx platform modernizes this framework through high-frequency automated data collection, a synthetic constant-horizon booking basket ($T+1$ to $T+45$), deterministic fare decomposition, and a rigorous two-tier mathematical formulation compliant with the **IMF CPI Manual (2020)**.

---

## Current MoSPI Challenges vs The APIx Solution

```
┌─────────────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────────────┐
│              Current MoSPI Pain Points                  │   │               The AndroMatrix APIx Solution             │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 1. Manual Collection & 45-Day Reporting Lag             │   │ 1. High-Frequency Automated Ingestion                   │
│    Monthly manual surveys introduce a 45-day lag,       │──▶│    Automated collection across 150+ domestic routes     │
│    completely missing dynamic real-time price surges.   │   │    every 6 hours across domestic scheduled carriers.    │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 2. Advance-Purchase Blindness                           │   │ 2. Synthetic Constant-Horizon Basket                    │
│    Flight booked for tomorrow (T+1) vs 30 days away     │──▶│    Samples strictly defined horizons (T+1 to T+45)      │
│    (T+30) differs by 200%–400%, creating severe bias.   │   │    to maintain consistent matched-model price tracking. │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 3. Route Misrepresentation                              │   │ 3. DGCA Passenger Traffic Weighting                     │
│    High-density metro routes and regional routes        │──▶│    Integrates official DGCA city-pair quarterly traffic │
│    averaged together without passenger volume weights.  │   │    datasets to apply dynamic route-weighting metrics.   │
├─────────────────────────────────────────────────────────┤   ├─────────────────────────────────────────────────────────┤
│ 4. Ancillary Noise Pollution                            │   │ 4. Deterministic Fare Decomposition                     │
│    Voluntary add-ons (meals, seat selection, baggage)   │──▶│    Automated validation isolates pure Base Fare + Fuel  │
│    pollute base transport inflation calculations.       │   │    Surcharge + Airport Tax, stripping voluntary add-ons.│
└─────────────────────────────────────────────────────────┘   └─────────────────────────────────────────────────────────┘
```

---

## Key Project Differentiators & Advanced Capabilities

1. **Horizon Trend Price Forecasting:**
   * Multi-horizon predictive modeling forecasting dynamic price movements and surge volatility across discrete advance windows ($T+1$ to $T+45$).
   * Delivers forward-looking transport inflation nowcasts up to 45 days before traditional survey publication.

2. **Autonomous 24/7 Anomaly Monitoring:**
   * Automated anomaly surveillance continuously monitoring domestic sectors to detect price surges, supply disruptions, or market variances.
   * Performs automated root-cause diagnostics and countermeasure isolation.

3. **Policy & Regulatory Intelligence:**
   * Grounded knowledge base providing contextual query resolution for MoSPI CPI guidelines, DGCA circulars, and IMF statistical standards.
   * Citations mapped to official regulatory publications.

4. **One-Click Executive Inflation Reports:**
   * Automated executive brief generation compiling headline inflation, core smoothed series, regional hotspots, and policy notes.
   * Instant export to formatted Markdown and print-ready executive summaries.

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

$$\text{Macro APIx} = \sum_{r} w_r \cdot I_r(t/0) \quad \text{where} \quad w_r = \frac{\text{Passenger Traffic}_r}{\sum_k \text{Passenger Traffic}_k}$$

---

## Technical Architecture & Methodology

### 1. Frontend & Visualization (`/frontend`)
* **Framework:** React 19, Vite, TypeScript
* **Styling:** Tailwind CSS, Shadcn UI design tokens
* **Data Visualization:** Recharts (30-Day APIx Trend, Lead-Time Elasticity, DGCA Sector Comparison, Fare Breakdown)
* **Key Modules:** National Overview, Sector Deep-Dive, Index Series, Predictive Horizons, Audit Explorer, Policy Intelligence.

### 2. Backend & Database API (`/backend`)
* **Runtime & Framework:** Node.js, Express REST API
* **Database Layer:** Prisma ORM with Time-Series Storage
* **Core Endpoints:** Real-time analytics, route elasticity, cryptographic audit logs, and telemetry.

### 3. Automated Ingestion Pipeline (`/scraper`)
* **Engine:** Python 3.10+ automated ingestion workers
* **Data Processing:** Pydantic schema validation, deterministic fare decomposition, Hampel/IQR outlier rejection, and SHA-256 cryptographic hashing.

---

## Feasibility & Risk Mitigation

| Challenge / Risk | Real-World Operational Threat | AndroMatrix Production Countermeasure |
| :--- | :--- | :--- |
| **Ingestion Availability** | Dynamic site layouts and network rate controls. | Resilient collection protocols, polite rate-limiting, distributed multi-node architecture, and automated schema normalization. |
| **Data Integrity** | Potential DOM shifts and unstandardized fare formats. | Deterministic payload validation isolating pure Base Fare from statutory taxes and fees while stripping voluntary add-ons. |
| **Dynamic Volatility** | Ephemeral flash sales or temporary supply spikes. | Rolling geometric smoothing with Hampel/IQR outlier suppression isolating Core Trimmed series from headline spikes. |
| **Legal & Compliance** | Strict adherence to fair-use and data governance policies. | Gathers publicly displayed unauthenticated consumer price quotes; ready for direct government-to-carrier API integration. |
| **Audit & Provenance** | Ensuring statistical trust for MoSPI / RBI certification. | Immutable SHA-256 cryptographic signature calculated and stored for every validated observation. |

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
│   │   └── schema.prisma              # Database schema (DailyIndex, ScrapeLog)
│   ├── src/
│   │   ├── controllers/               # Analytics, logs, and AI controllers
│   │   ├── routes/                    # API route definitions
│   │   └── services/                  # Computation & domain engines
│   └── package.json
│
└── scraper/                           # Python Automated Ingestion Pipeline
    └── README.md
```

---

## Multi-Stakeholder Dividends

* **National Statistical Office (MoSPI):** Ingests daily validated quotes across 150+ corridors, replacing 45-day reporting lag with real-time continuous transport CPI series.
* **Reserve Bank of India (RBI / MPC):** Accesses forward-looking transport nowcasts up to 45 days in advance, improving monetary inflation projections.
* **Competition Regulators (CCI / DGCA):** Monitors route-level airline price parity to detect unjustified spreads and capacity imbalances.
* **Aviation Economists & Researchers:** Provides standardized constant-horizon datasets ($T+1$ to $T+45$) for empirical transport economics research.
* **Citizens & Passenger Advocacy:** Promotes transparent fare unbundling and highlights optimal advance-booking saving horizons.

---

## Quick Start & Setup Instructions

### Prerequisites
* **Node.js:** v18 or later
* **npm:** v9 or later
* **Python:** 3.10 or later
* **PostgreSQL Database:** Local instance or cloud database

### 1. Backend Setup
```bash
cd backend
npm install

# Configure your environment variables
cp .env.example .env
# Set DATABASE_URL="postgresql://username:password@localhost:5432/apix_db" in .env

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
