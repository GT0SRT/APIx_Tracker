# AndroMatrix APIx - Backend REST API & Database Architecture
### High-Performance Time-Series Price Index & Ingestion Server
**Smart India Hackathon 2026 · Problem Statement SIH26056**  
**Team ID:** 146729 · **Team Name:** AndroMatrix  

---

### 🌐 Quick Navigation
* [🏠 Main Project Documentation](../README.md)
* [🖥️ Frontend Analytics Dashboard](../frontend)
* [🕷️ Resilient Scraper Engine](../scraper)
* [🚀 Live Production Demo](https://apix-tracker.vercel.app/)

---

## Overview

The **APIx Backend Server** is the centralized calculation, data persistence, and API gateway layer of the AndroMatrix Airfare Price Index platform. Built on **Node.js, Express, and PostgreSQL** (interfaced via **Prisma ORM**), it manages time-series flight observations, computes real-time macroeconomic indices, and serves high-frequency telemetry to the executive dashboard.

---

## Backend Architecture

```mermaid
flowchart TD
    subgraph INGRESS["API Ingress & Security"]
        REQ["Incoming Client Requests"] --> ROUTER["Express.js REST Router (/api/v1)"]
        AUTH_MW["JWT Auth Middleware<br/>(Admin Protected Endpoints)"]
        INGEST_MW["Ingest Token Middleware<br/>(x-ingest-token Scraper Auth)"]
        
        ROUTER --> AUTH_MW
        ROUTER --> INGEST_MW
    end

    subgraph CONTROLLERS["Controllers & Calculation Engines"]
        C_ANALYTICS["Analytics Controller<br/>• Summary KPI Aggregation<br/>• 30-Day Trend Time-Series<br/>• Constant-Horizon Elasticity"]
        C_ROUTES["Routes Controller<br/>• DGCA Q3 Traffic Weights (w_r)<br/>• Cross-Airline Parity Analysis"]
        C_LOGS["Logs & Ingestion Controller<br/>• Chunked Batch Ingestion<br/>• SHA-256 Provenance Verifier<br/>• In-Memory Reactive Buffer"]
        C_AI["AI & Copilot Controller<br/>• RAG Policy Q&A Engine<br/>• Horizon Trend ML Models"]

        AUTH_MW --> C_ANALYTICS
        AUTH_MW --> C_ROUTES
        AUTH_MW --> C_AI
        INGEST_MW --> C_LOGS
    end

    subgraph ENGINES["Domain Computation Services"]
        JEVONS["IMF Jevons Geometric Mean Engine<br/>I_J = exp( (1/n) * sum(ln(P_i)) )"]
        LASPEYRES["Modified Laspeyres Aggregator<br/>Macro APIx = sum( w_r * I_r )"]
        OUTLIER["Statistical Outlier Filters<br/>Tukey IQR (1.5x) + Hampel MAD (3-sigma)"]

        C_ANALYTICS --- JEVONS
        C_ANALYTICS --- LASPEYRES
        C_LOGS --- OUTLIER
    end

    subgraph STORAGE["Persistence Layer"]
        PRISMA["Prisma ORM Client<br/>(Type-Safe Query Builder)"]
        MEM_BUF[("In-Memory Telemetry Buffer<br/>(Zero-Lag Instant Reactivity)")]
        DB[("PostgreSQL Database<br/>(TimescaleDB Time-Series Ready)")]

        C_LOGS --> MEM_BUF
        C_LOGS --> PRISMA
        C_ANALYTICS <--> PRISMA
        C_ROUTES <--> PRISMA
        PRISMA <--> DB
    end
```

---

## Database Models Overview (`prisma/schema.prisma`)

The database schema is structured for time-series aviation pricing and cryptographic auditability:

| Model | Purpose | Key Attributes |
| :--- | :--- | :--- |
| **`Airport`** | Master domestic airport catalog under DGCA | `iataCode` (e.g. DEL, BOM), `city`, `airportName`, `state` |
| **`Airline`** | Domestic scheduled carrier registry | `code` (e.g. 6E, AI, QP, SG), `name`, `brandColor`, `isActive` |
| **`Route`** | DGCA domestic monitored city-pairs | `routeCode` (e.g. DEL-BOM), `dgcaWeight` ($w_r$), `distanceKm`, `isTrunkRoute` |
| **`FareObservation`** | Individual flight price observations | `flightNumber`, `departureDate`, `advanceWindow` ($T+1$ to $T+45$), `baseFare`, `fuelSurcharge`, `airportTaxUDF`, `taxGST`, `totalFare`, `sha256Hash`, `isOutlier` |
| **`DailyRouteIndex`** | Elementary Jevons micro-index records | `date`, `routeId`, `advanceWindow`, `jevonsIndexValue`, `avgBaseFare`, `sampleCount` |
| **`MacroDailyIndex`** | Composite national macro APIx index | `date`, `compositeIndex` ($\sum w_r \cdot I_r$), `baselineIndex`, `volatilityRating`, `momInflation` |
| **`ScraperRunLog`** | Automated ingestion run health & provenance | `runStartedAt`, `status`, `totalScraped`, `validRecords`, `outliersFiltered`, `batchSha256` |
| **`User`** | Administrative authentication | `email`, `passwordHash`, `role` (`ADMIN`, `VIEWER`), `createdAt` |

---

## REST API Endpoints Catalog

### 1. Macroeconomic Analytics & Index Series
* **`GET /api/v1/analytics/summary`** — Returns headline KPI cards (National APIx, Volatility Rating, Validated Quotes, National Average Base Fare).
* **`GET /api/v1/analytics/index-trend`** — Returns the 30-day APIx inflation trend vs Base 2024=100 anchor.
* **`GET /api/v1/analytics/elasticity`** — Returns lead-time booking curve pricing across $T+1, T+7, T+15, T+30, T+45$ horizons.
* **`GET /api/v1/analytics/fare-decomposition`** — Returns aggregate unbundled breakdown (Base Fare, Fuel Surcharge, Airport Tax).
* **`GET /api/v1/analytics/series`** *(Admin)* — Returns multi-series comparison (Headline APIx vs Core Trimmed vs simulated MoSPI 45-day survey lag).

### 2. Routes & Competition Parity
* **`GET /api/v1/routes`** — Lists monitored DGCA city-pairs with quarterly passenger traffic volume shares ($w_r$).
* **`GET /api/v1/routes/parity`** — Cross-airline competition surveillance comparing IndiGo ($6E$), Air India ($AI$), and Akasa Air ($QP$) with spread percentages and monopoly indicators.

### 3. Ingestion & Cryptographic Audit
* **`GET /api/v1/logs/recent`** — Returns paginated flight price observations with SHA-256 signatures, unbundled fare breakdowns, and Hampel verification status.
* **`POST /api/v1/logs/ingest`** *(Ingest Token Protected)* — High-throughput ingestion endpoint receiving chunked batches from Python scraper workers with atomic database transactions.
* **`GET /api/v1/logs/telemetry`** — Real-time telemetry on scraper cluster uptime, ingestion velocity, and cryptographic verification rate.

### 4. AI Intelligence & Forecasting
* **`POST /api/v1/ai/copilot`** — Grounded policy assistant providing contextual answers to MoSPI CPI and DGCA transport questions with citations.
* **`GET /api/v1/forecast/predict`** — Generates forward-looking nowcasts and multi-horizon trend forecasts.

---

## Setup & Database Configuration

### 1. Prerequisites
* **Node.js:** v18.0.0 or later
* **PostgreSQL:** v14 or later (local instance or cloud database like Neon / Render)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration (`.env`)
```bash
cp .env.example .env
```
Configure your environment variables in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/apix_db?sslmode=require"
PORT=5000
JWT_SECRET="your_jwt_secret_key"
INGEST_SECRET="apix_secret_token_sih2026"
```

### 4. Database Initialization & Seeding
```bash
# 1. Generate type-safe Prisma client
npm run prisma:generate

# 2. Push schema to database (zero-downtime prototyping)
npm run prisma:push

# 3. Seed database with airports, trunk routes, weights, and baseline data
npm run prisma:seed
```

### 5. Visual Database GUI (Prisma Studio)
Inspect and manage database records interactively in your browser at `http://localhost:5555`:
```bash
npm run prisma:studio
```

### 6. Start the Backend API Server
```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```
The server starts at `http://localhost:5000`.

---

### Team AndroMatrix · Smart India Hackathon 2026
*Robust time-series price indexing for the Ministry of Statistics and Programme Implementation.*
