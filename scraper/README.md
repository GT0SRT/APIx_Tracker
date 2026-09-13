# AndroMatrix APIx Scraper Engine
### Automated Airfare Price Index Data Ingestion Pipeline
**Smart India Hackathon 2026 · Problem Statement SIH26056**  
*Team AndroMatrix*

---

## Overview

The **APIx Scraper Engine** is the automated data collection and cleaning subsystem of the AndroMatrix Airfare Price Index platform. Engineered for the Ministry of Statistics and Programme Implementation (**MoSPI**) and the Reserve Bank of India (**RBI**), it replaces outdated 45-day manual price surveying with high-frequency, tamper-evident automated scraping of domestic scheduled airfares.

---

## Key Capabilities & Methodology (PPT Alignment)

1. **Synthetic Constant-Horizon Basket ($T+1$ to $T+45$):**
   * Eliminates advance-purchase bias by tracking fixed lead-time horizons:
     * **$T+1$**: Last-minute emergency travel (captures surge elasticity)
     * **$T+7$**: 1-week business/short-notice travel
     * **$T+15$**: Mid-horizon standard booking
     * **$T+30$**: Advance planned booking
     * **$T+45$**: Baseline long-horizon threshold
   * Full 45-day continuous horizon available via `--full-45-days`.

2. **Top 15 High-Density Domestic Corridors (~60% National Traffic):**
   * `DEL-BOM`, `DEL-BLR`, `BOM-BLR`, `MAA-DEL`, `DEL-CCU`, `DEL-HYD`, `BOM-HYD`, `BLR-HYD`, `BOM-MAA`, `DEL-PNQ`, `DEL-AMD`, `BOM-CCU`, `BLR-CCU`, `BOM-GOI`, `DEL-GOI`.
   * Covers major carriers: **IndiGo (6E)**, **Air India (AI)**, **Akasa Air (QP)**, **Air India Express (IX)**, and **SpiceJet (SG)**.

3. **Deterministic Fare Decomposition:**
   * Isolates pure **Base Fare** from statutory taxes and fees:
     $$\text{Total Fare} = \text{Base Fare} + \text{Fuel Surcharge (YQ)} + \text{Airport Tax (UDF)} + \text{GST (5\%)}$$
   * Strips all voluntary consumer add-ons (ancillary baggage, seat selection, meals).

4. **Statistical Outlier & Glitch Rejection:**
   * **Interquartile Range (IQR) Filter:** Rejects flash promotions or glitches outside $[Q1 - 1.5 \cdot IQR, Q3 + 1.5 \cdot IQR]$.
   * **Hampel Filter (MAD):** Median Absolute Deviation suppression for single-flight price spikes.

5. **Cryptographic SHA-256 Provenance:**
   * Every scraped observation is hashed with a deterministic SHA-256 signature for tamper-evident data provenance conforming to the National Data Governance Framework (NDGF).
   * Generates a batch Merkle digest for each scraping run.

6. **Anti-Bot Defenses & Exponential Backoff:**
   * Uses **Playwright Stealth** to bypass headless browser fingerprinting.
   * Emulates Indian locale (`en-IN`) and desktop Chrome signatures.
   * Jittered exponential backoff:
     $$\text{Wait} = \min(\text{max\_delay}, \text{base\_delay} \cdot 2^{\text{attempt}}) \pm \text{jitter}$$
   * Secondary OTA engine with `curl_cffi` JA3/JA4 TLS ClientHello spoofing.

---

## Directory Layout

```
scraper/
├── .env                        # Local environment variables
├── .env.example                # Template for environment configuration
├── pytest.ini                  # Pytest configuration
├── requirements.txt            # Python dependencies
├── run_scraper.py              # Root convenience execution launcher
├── data/                       # Local JSON/CSV backups & audit logs
│   ├── observations_latest.json
│   ├── observations_latest.csv
│   └── summary_batch_*.json
├── src/
│   ├── config.py               # Route catalog, horizons, and fee matrices
│   ├── schemas.py              # Pydantic V2 schema matching Prisma FareObservation
│   ├── engines/
│   │   ├── base.py             # BaseEngine with backoff & retry
│   │   ├── google_flights.py   # Playwright Stealth multi-carrier engine
│   │   └── easemytrip.py       # curl-cffi OTA engine
│   ├── processors/
│   │   ├── decomposer.py       # Deterministic Base + Tax decomposition
│   │   ├── outliers.py         # IQR and Hampel outlier filters
│   │   └── crypto.py           # SHA-256 provenance generator
│   ├── pipeline.py             # 7-phase execution orchestrator
│   ├── ingestion_client.py     # HTTP REST bridge to Backend API
│   └── cli.py                  # Rich terminal UI and argument parser
└── tests/
    ├── test_schemas.py         # Pydantic schema validation tests
    └── test_processors.py      # Decomposition & outlier filter tests
```

---

## Quick Start

### 1. Install Dependencies
```bash
cd scraper
pip install -r requirements.txt
playwright install chromium
```

### 2. Configure Environment (`.env`)
```bash
cp .env.example .env
```
Key variables:
* `BACKEND_API_URL`: Backend REST API URL (e.g. `http://localhost:5000` or production URL).
* `INGEST_SECRET`: Secret token for data transmission.
* `SCRAPER_PORTAL`: `google_flights` (default) or `easemytrip`.
* `SCRAPER_CONCURRENCY`: Number of concurrent workers (default: `3`).

### 3. Run Automated Tests
```bash
pytest
```

### 4. Execute Scraper CLI

**Run default 15 demo routes across core horizons ($T+1, T+7, T+15, T+30, T+45$):**
```bash
python run_scraper.py
```

**Fast single route test (e.g. DEL-BOM on T+1 and T+7):**
```bash
python run_scraper.py --routes DEL-BOM --horizons 1,7
```

**Run top 5 trunk routes:**
```bash
python run_scraper.py --routes top5 --horizons 1,7,15,30,45
```

**Run full 45-day booking window:**
```bash
python run_scraper.py --routes DEL-BOM --full-45-days
```

**Run without posting to backend (local export only):**
```bash
python run_scraper.py --routes DEL-BOM --no-ingest
```

---

## Automated 6-Hour Cron via GitHub Actions

The scraper includes `.github/workflows/scrape_cron.yml`, which runs autonomously every 6 hours (`0 */6 * * *`) on GitHub's free runners.

To configure production ingestion:
1. Push this repository to GitHub.
2. Go to **Settings > Secrets and variables > Actions**.
3. Add Repository Secret:
   * `BACKEND_API_URL`: Your hosted backend endpoint (e.g. `https://your-api.onrender.com`).
   * `INGEST_SECRET`: Your shared secret token.
4. The workflow will run automatically every 6 hours and can also be triggered manually via the **Actions** tab ("Run workflow").

---

## Output Data Structure

Observations perfectly match the backend Prisma `FareObservation` schema:

```json
{
  "route_code": "DEL-BOM",
  "airline_code": "6E",
  "airline_name": "IndiGo",
  "flight_number": "6E-0101",
  "departure_date": "2026-09-14",
  "advance_window": "T+1",
  "base_fare": 4940.48,
  "fuel_surcharge": 750.0,
  "airport_tax_udf": 450.0,
  "tax_gst": 284.52,
  "total_fare": 6425.0,
  "is_outlier": false,
  "provenance_status": "CLEANED",
  "sha256_hash": "f5c2adc69ebef3104713f0b4f4e925400c1e814eaa6965c8ceda4c942ba4da4a",
  "timestamp": "2026-09-13T12:58:27.512530+00:00",
  "source_portal": "GOOGLE_FLIGHTS"
}
```
