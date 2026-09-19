# APIx Tracker --- Frontend

> **Executive Airfare Price Intelligence Dashboard**\
> A modern React + TypeScript frontend for the **Airfare Price Index
> (APIx)** platform, built for analytics, forecasting, auditability,
> methodology transparency, and executive reporting.

------------------------------------------------------------------------

## 🚀 Overview

The APIx Tracker frontend is the presentation and interaction layer of
the APIx platform.

It turns airfare and macroeconomic data into an executive-friendly
dashboard covering:

-   National Airfare Price Index (APIx)
-   Weighted base airfare
-   Inflation trends and index series
-   Route and sector-level analysis
-   Advance-booking / lead-time elasticity
-   AI-assisted statistical intelligence
-   Price forecasting
-   Policy and methodology intelligence
-   Data-ingestion and SHA-256 audit information
-   Executive report generation
-   Protected administrative views
-   Floating AI statistical copilot

The interface is designed around a clean **executive analytics**
experience rather than a conventional CRUD dashboard.

------------------------------------------------------------------------

## ✨ Key Features

### 📊 National Overview

The public dashboard provides a high-level view of airfare inflation and
national indicators.

Highlights include:

-   National APIx value
-   Weighted base fare
-   Nowcasting lead
-   Validated ingestion volume
-   30-day national inflation trend
-   National lead-time elasticity basket
-   Route / sector deep-dive entry points

------------------------------------------------------------------------

### 📈 Index Series

The index-series interface is designed to expose the movement of airfare
inflation over time and support comparison between:

-   High-frequency APIx observations
-   Core / trimmed index series
-   Traditional reporting horizons
-   Historical index trajectories

------------------------------------------------------------------------

### 🛫 Route & Lead-Time Analysis

The route analysis experience focuses on advance-purchase behaviour and
airline/sector pricing.

It supports concepts such as:

-   T+1 through T+45 booking horizons
-   Route-specific pricing
-   Sector comparisons
-   Airline price parity
-   Lead-time elasticity
-   Route-level analytical exploration

------------------------------------------------------------------------

### 🤖 AI Intelligence Hub

The frontend includes multiple AI-oriented interfaces:

-   **Agentic AI**
-   **ML Forecasting**
-   **Policy RAG**
-   **Floating AI Statistical Copilot**

These interfaces are organized as dedicated React components so
analytical capabilities can evolve independently from the core
dashboard.

------------------------------------------------------------------------

### 🔮 Forecasting

The forecasting interface presents predictive airfare insights and
multi-horizon trends.

The UI is structured to support:

-   Forecast exploration
-   Trend interpretation
-   Model-generated insights
-   Horizon-based comparisons
-   Analytical summaries

------------------------------------------------------------------------

### 🔐 Authentication & Protected Views

The application separates public and administrator-only experiences.

Public users can access:

-   National Overview
-   Help & Support

Authenticated administrators can access:

-   Index Series
-   Routes & Horizons
-   AI Intelligence
-   Audit Logs
-   Methodology
-   Executive reporting features

Authentication state is managed through:

``` text
src/context/AuthContext.tsx
```

Protected routes are enforced at the application routing layer.

------------------------------------------------------------------------

### 🔎 Ingestion & Audit

The audit interface provides a frontend for exploring ingestion and
provenance information.

The dashboard is designed around traceability concepts including:

-   Validated ingestion
-   SHA-256 verification
-   Audit logs
-   Data provenance
-   Operational telemetry

------------------------------------------------------------------------

### 📐 Methodology

The methodology section presents the mathematical and statistical
concepts behind the APIx system.

The frontend includes reusable mathematical rendering through:

``` text
src/components/common/MathFormula.tsx
```

The interface is designed to make formulas and methodology accessible to
both technical and executive users.

------------------------------------------------------------------------

### 📄 Executive Reporting

Authenticated users can generate executive-oriented reports through:

-   Executive Report modal
-   One-click report interface
-   Formatted summaries
-   Print-ready reporting workflows

------------------------------------------------------------------------

### 💬 Floating AI Copilot

A floating chatbot is available globally through:

``` text
src/components/ai/FloatingChatBot.tsx
```

It acts as an AI/statistical copilot layer on top of the dashboard.

The component is mounted globally from:

``` text
src/App.tsx
```

------------------------------------------------------------------------

## 🧱 Tech Stack

  Technology       Purpose
  ---------------- --------------------------------------
  React 19         UI framework
  TypeScript       Type-safe application development
  Vite             Development server and build tool
  React Router     Client-side routing
  TanStack Query   Server-state and API data management
  Recharts         Data visualization
  Tailwind CSS     Utility-first styling
  Lucide React     UI icons
  KaTeX            Mathematical formula rendering
  clsx             Conditional class composition
  tailwind-merge   Tailwind class merging
  Oxlint           Fast linting

------------------------------------------------------------------------

## 📁 Project Structure

``` text
frontend/
│
├── public/
│   ├── bot-avatar.png
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   │
│   ├── assets/
│   │   └── static frontend assets
│   │
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AgenticAiModal.tsx
│   │   │   ├── FloatingChatBot.tsx
│   │   │   ├── MlForecastingModal.tsx
│   │   │   └── PolicyRagModal.tsx
│   │   │
│   │   ├── auth/
│   │   │   └── LoginModal.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── CommonUI.tsx
│   │   │   ├── MathFormula.tsx
│   │   │   └── Pagination.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ExecutiveReportModal.tsx
│   │   │   └── OneClickReportModal.tsx
│   │   │
│   │   ├── ui/
│   │   │   └── button.tsx
│   │   │
│   │   └── views/
│   │       ├── AiHubView.tsx
│   │       ├── HelpSupportView.tsx
│   │       ├── IndexSeriesView.tsx
│   │       ├── IngestionAuditView.tsx
│   │       ├── MethodologyView.tsx
│   │       ├── OverviewView.tsx
│   │       └── RoutesHorizonsView.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── data/
│   │   ├── agenticData.ts
│   │   ├── forecastingData.ts
│   │   ├── mockData.ts
│   │   ├── navigation.ts
│   │   └── policyRagData.ts
│   │
│   ├── hooks/
│   │   └── useApixQueries.ts
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── types/
│   │   └── apix.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── components.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

------------------------------------------------------------------------

## 🧭 Application Routes

  Route                Access   Purpose
  -------------------- -------- ---------------------------------
  `/`                  Public   National APIx overview
  `/overview`          Public   Redirects to overview
  `/help-support`      Public   Help and support
  `/index-series`      Admin    Index history and series
  `/routes-horizons`   Admin    Route and lead-time analysis
  `/ai-intelligence`   Admin    AI intelligence hub
  `/audit-logs`        Admin    Ingestion and audit information
  `/methodology`       Admin    Methodology and formulas

Legacy aliases are also handled by the router and redirected to their
canonical routes.

------------------------------------------------------------------------

## 🔌 API Integration

API communication is centralized in:

``` text
src/services/api.ts
```

React Query hooks are organized in:

``` text
src/hooks/useApixQueries.ts
```

This separation keeps:

``` text
UI Components
      ↓
React Query Hooks
      ↓
API Service Layer
      ↓
Backend APIs
```

The frontend therefore avoids scattering HTTP calls throughout
individual UI components.

------------------------------------------------------------------------

## ⚙️ Environment Variables

Create a local environment file from the example:

``` bash
cp .env.example .env
```

On Windows PowerShell, you can copy it with:

``` powershell
Copy-Item .env.example .env
```

Configure the API endpoint required by your local backend.

> Never commit real secrets, API keys, tokens, or private credentials to
> Git.

------------------------------------------------------------------------

## 🛠️ Getting Started

### 1. Enter the frontend directory

``` bash
cd frontend
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

``` bash
cp .env.example .env
```

Update `.env` for your local backend/API configuration.

### 4. Start development server

``` bash
npm run dev
```

Vite will display the local development URL in the terminal.

------------------------------------------------------------------------

## 📦 Production Build

Create a production build:

``` bash
npm run build
```

Preview the production build locally:

``` bash
npm run preview
```

------------------------------------------------------------------------

## 🧹 Linting

Run Oxlint:

``` bash
npm run lint
```

------------------------------------------------------------------------

## 🔄 Development Workflow

A typical frontend development cycle is:

``` text
1. Start backend
       ↓
2. Configure frontend .env
       ↓
3. npm install
       ↓
4. npm run dev
       ↓
5. Develop / test UI
       ↓
6. npm run lint
       ↓
7. npm run build
       ↓
8. Commit changes
```

------------------------------------------------------------------------

## 🎨 Design Philosophy

The frontend follows an **executive analytics** visual language:

-   Information-dense without being cluttered
-   Clear hierarchy for important indicators
-   Responsive dashboard layout
-   Consistent card-based analytical sections
-   Strong typography hierarchy
-   Accessible navigation patterns
-   Dedicated public and admin experiences
-   Interactive analytical modules
-   Reusable UI and data components

The goal is to make complex airfare intelligence understandable at a
glance while still exposing deeper analytical views when required.

------------------------------------------------------------------------

## 🔒 Security Notes

The frontend contains protected routes and authentication-aware UI, but
frontend route protection should **never be treated as the sole security
boundary**.

Authorization must also be enforced by the backend/API.

Do not commit:

``` text
.env
API keys
JWT secrets
Database credentials
Private tokens
Production credentials
```

Use `.env.example` to document required configuration without exposing
secrets.

------------------------------------------------------------------------

## 🧪 Before Committing

Run:

``` bash
npm run lint
npm run build
```

Then inspect:

``` bash
git status
```

For a focused change, prefer adding only the files you actually
modified:

``` bash
git add frontend/src/components/ai/FloatingChatBot.tsx
```

Avoid blindly using:

``` bash
git add .
```

when working in a repository containing unrelated files.

------------------------------------------------------------------------

## 📌 Project Context

**APIx Tracker** is the frontend layer of an airfare price intelligence
platform developed around the **Airfare Price Index (APIx)** concept.

The platform combines airfare observations, index methodology,
route-level analysis, forecasting, policy intelligence, and auditability
into a unified analytical experience.

The frontend is responsible for turning those capabilities into a usable
interface for analysts, administrators, and executive stakeholders.

------------------------------------------------------------------------

## 👨‍💻 Frontend Architecture

At a high level:

``` text
                    APIx Tracker Frontend
                             │
              ┌──────────────┴──────────────┐
              │                             │
        Public Experience              Admin Experience
              │                             │
        National Overview          Authentication Context
        Help & Support                       │
                                    ┌────────┼────────┐
                                    │        │        │
                                Analytics    AI     Audit
                                    │        │        │
                                Routes     Forecast  Logs
                                Index      Policy
                                Methodology
                                    │
                             Executive Reports
                                    │
                              API Service Layer
                                    │
                              Backend / APIs
```

------------------------------------------------------------------------

## 🏁 Status

**Frontend:** Active development\
**Build system:** Vite\
**Language:** TypeScript\
**UI:** React\
**Architecture:** Component-based + route-driven\
**Data layer:** API services + TanStack Query\
**Analytics:** Recharts + custom dashboard components

------------------------------------------------------------------------

## 📄 License

Add the project's official license here when one is established.

------------------------------------------------------------------------

### Built for data-driven airfare intelligence.
