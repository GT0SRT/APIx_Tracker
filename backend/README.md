# APIx Tracker - Backend & Database Architecture

This directory contains the Node.js / Express REST API and PostgreSQL database configuration managed via **Prisma ORM** for the **AndroMatrix APIx Platform** (Smart India Hackathon 2026, Problem Statement 26056).

---

## Database Models Overview (`prisma/schema.prisma`)

| Model | Purpose | Key Attributes |
| :--- | :--- | :--- |
| **`Airport`** | Indian domestic airports under DGCA | `iataCode` (e.g. DEL, BOM), `city`, `airportName`, `state` |
| **`Airline`** | Domestic carrier registry | `code` (e.g. 6E, AI, QP, SG), `name`, `brandColor`, `isActive` |
| **`Route`** | 15 Top DGCA City-Pairs | `routeCode` (e.g. DEL-BOM), `dgcaWeight` ($w_r$), `distanceKm`, `isTrunkRoute` |
| **`FareObservation`** | 6-hour interval scraped flight quotes | `flightNumber`, `departureDate`, `advanceWindow` ($T+1$ to $T+45$), `baseFare`, `fuelSurcharge`, `airportTaxUDF`, `taxGST`, `totalFare`, `sha256Hash` |
| **`DailyRouteIndex`** | Elementary Jevons Micro-Indices | `date`, `routeId`, `advanceWindow`, `jevonsIndexValue`, `avgBaseFare`, `sampleCount` |
| **`MacroDailyIndex`** | National Weighted Composite APIx | `date`, `compositeIndex` ($\sum w_r \cdot I_r$), `baselineIndex`, `volatilityRating`, `momInflation`, `yoyInflation` |
| **`ScraperRunLog`** | Automated pipeline health & provenance | `runStartedAt`, `status`, `totalScraped`, `validRecords`, `outliersFiltered`, `batchSha256` |

---

## Setup & Database Commands

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and set your PostgreSQL connection string:
```bash
cp .env.example .env
```
In `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/apix_db?sslmode=require"
PORT=5000
```

### 3. Generate Prisma Client
Generates the type-safe Prisma query client based on `schema.prisma`:
```bash
npm run prisma:generate
```

### 4. Push Schema to Database (Zero-downtime Prototyping)
Synchronizes the Prisma schema directly with your NeonDB / PostgreSQL instance without needing migrations:
```bash
npm run prisma:push
```

### 5. Seed the Database
Populates the database with airports, airlines, all 15 DGCA trunk routes with quarterly traffic volume weights, historical 30-day APIx indices, lead-time elasticity data, and verified sample scrapes:
```bash
npm run prisma:seed
```

### 6. Visual Database GUI (Prisma Studio)
Launch Prisma Studio in your browser (`http://localhost:5555`) to view, filter, and inspect records:
```bash
npm run prisma:studio
```

### 7. Start the Backend API Server
```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```
The server runs on `http://localhost:5000`.

---

## API Endpoints

* `GET /api/v1/analytics/index-trend` - 30-day APIx vs Baseline time-series.
* `GET /api/v1/analytics/elasticity` - Average fare across advance booking horizons ($T+1, T+7, T+15, T+30, T+45$).
* `GET /api/v1/logs/recent` - Latest standardized flight price scrapes with SHA-256 provenance.
