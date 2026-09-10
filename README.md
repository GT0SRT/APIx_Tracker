# APIx: Airfare Price Index Dashboard

APIx is an advanced, end-to-end analytics platform designed to calculate and display the Airfare Price Index (APIx) using the Jevons formula. It systematically scrapes dynamic airline pricing data, standardizes it, and visualizes inflation trends, route comparisons, and lead-time elasticity.

## Architecture

This repository is organized as a monorepo consisting of three main components:

1.  **Frontend (`/frontend`)**
    *   A Next.js and React-based dashboard.
    *   Visualizes APIx inflation trends, route-wise comparisons, average fare breakdowns, and live data pipeline logs.
    *   Uses Tailwind CSS, Recharts, and Shadcn UI components.
2.  **Backend (`/backend`)**
    *   A Node.js and Express RESTful API.
    *   Utilizes Prisma ORM to connect to a PostgreSQL database (NeonDB).
    *   Serves aggregated analytics and recent scraping logs to the frontend.
3.  **Scraper (`/scraper`)**
    *   A Python automation script utilizing Playwright.
    *   Runs on a schedule to fetch pricing data for 15 top DGCA city-pairs across 5 advance-purchase windows (T+1, T+7, T+15, T+30, T+45).
    *   Incorporates robust edge-case handling including CAPTCHA/403 exponential backoff, Sold-Out flight imputation (NULL logging), IQR-based outlier detection, and dynamic DOM parsing.

## Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   PostgreSQL database (e.g., NeonDB)

### 1. Backend Setup
```bash
cd backend
npm install
# Set up your environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL
# Generate Prisma Client and push schema
npx prisma generate
npx prisma db push
# Start the server
npm start
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
# Start the development server
pnpm dev
```

### 3. Scraper Setup
```bash
cd scraper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
# Set up your environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL
# Run the scraper
python scraper.py
```
