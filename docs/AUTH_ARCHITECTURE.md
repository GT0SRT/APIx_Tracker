# APIx Tracker: Single-Role Admin Authentication Architecture

## 1. Architectural Overview

The **APIx Tracker** platform is designed as an institutional macroeconomic index tracking system for the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Reserve Bank of India (RBI)**.

Given the statistical sensitivity of granular airline pricing data, proprietary scraping telemetry, and dynamic pricing anomaly surveillance, the system enforces a **single-role authentication model**:

```
+-------------------------------------------------------------------------------------------------+
|                                        APIx Tracker Clients                                     |
|                                                                                                 |
|   +---------------------------------------+           +-------------------------------------+   |
|   |         Public Viewer (Default)       |           |          Logged-In Admin            |   |
|   |  - National Overview (Macro CPI)      |           |  - Full Platform Clearance          |   |
|   |  - Help & Support / Methodology Theory|           |  - Route Corridors & Elasticity     |   |
|   |  - Macroeconomic General AI Copilot   |           |  - Anomaly Root Cause Analysis      |   |
|   |                                       |           |  - SHA-256 Ingestion Audit Logs     |   |
|   +---------------------------------------+           +-------------------------------------+   |
+-------------------------------------------------------------------------------------------------+
                                      |                                       |
                   No Bearer Token    |                                       | Bearer <JWT>
                                      v                                       v
+-------------------------------------------------------------------------------------------------+
|                                     Express Backend Security Layer                              |
|                                                                                                 |
|   +--------------------------+     +--------------------------+     +-----------------------+   |
|   |       Public Routes      |     |     optionalToken (AI)   |     |      verifyToken      |   |
|   |  - /api/analytics/summary|     |  - /api/ai/chat          |     |  - /api/routes/*      |   |
|   |  - /api/analytics/trend  |     |    (Public: Macro Only)  |     |  - /api/logs/*        |   |
|   |  - /api/support/*        |     |    (Admin: Full Tools)   |     |  - /api/analytics/*   |   |
|   |  - /health               |     +--------------------------+     |    (elasticity/decomp)|   |
|   +--------------------------+                                      +-----------------------+   |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Core Security Principles

### 2.1 Single Role: Admin vs. Public Viewer
There are no multi-tenant roles, customer tiers, or self-registration endpoints.
- **Public Viewer**: Default state for all unauthenticated requests. Users have access to aggregate macroeconomic series (Headline vs. Core Trimmed APIx) and official documentation.
- **Admin**: Authenticated official holding a cryptographically signed JSON Web Token (JWT). Admins have complete access to the 42 DGCA city-pair corridors, dynamic yield curves ($T+1$ to $T+45$), carrier price-parity benchmarks, and raw SHA-256 ingestion provenance feeds.

### 2.2 Zero-Trust Perimeter (No Public Registration)
To prevent unauthorized account creation on government statistical infrastructure:
- **No public signup route exists** (`POST /api/auth/register` is explicitly omitted).
- Admin accounts are provisioned directly into the database using a secure server-side provisioning script (`scripts/seed_admin.js`).
- Passwords are salt-hashed using **bcrypt** with $10$ salt rounds (`bcrypt.hash(password, 10)`).

---

## 3. Cryptographic Standards & Specifications

| Component | Standard / Specification |
|---|---|
| **Password Hashing** | `bcryptjs` (Blowfish-based cipher with 10 salt rounds) |
| **Token Format** | RFC 7519 JSON Web Token (JWT) |
| **Signing Algorithm** | HMAC SHA-256 (`HS256`) |
| **Token Expiry** | 24 Hours (`expiresIn: '24h'`) |
| **Token Transmission** | HTTP Header `Authorization: Bearer <token>` |
| **Audit Provenance** | Immutable SHA-256 hash sealing per observation batch |

---

## 4. Database Schema & Provisioning

### 4.1 Prisma `User` Model
```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  password_hash String
  role          String   @default("ADMIN")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
}
```

### 4.2 Seed Script (`scripts/seed_admin.js`)
The seed script securely provisions or synchronizes the administrator credentials:
```bash
# Provision Admin Account
npm run seed:admin
```
The script reads `ADMIN_EMAIL` (default: `admin@apix.gov.in`) and `ADMIN_PASSWORD` (default: `Admin@APIx2026!`) from environment variables, verifies non-duplication, hashes the password via bcrypt, and stores it in PostgreSQL (NeonDB).

---

## 5. Middleware Architecture

### 5.1 `verifyToken` (Strict Authorization Guard)
Applied to all sensitive and operational REST endpoints:
1. Extracts token from `req.headers['authorization']` (`Bearer <token>`).
2. Rejects requests lacking a token with `401 Unauthorized` (`{ success: false, error: 'Access denied. Admin authentication required.' }`).
3. Validates signature and expiration via `jwt.verify(token, JWT_SECRET)`.
4. Confirms `decoded.role === 'ADMIN'`.
5. Attaches `req.user = decoded` to the Express request pipeline.

### 5.2 `optionalToken` (Dual-Mode Policy Guard)
Applied to endpoints that support both public baselines and privileged capabilities (e.g., `/api/ai/chat`):
1. Checks for `Bearer <token>`.
2. If valid and signed: populates `req.user` with Admin context.
3. If absent or expired: sets `req.user = null` without aborting execution, allowing downstream handlers to adapt their behavior.

---

## 6. Route Protection Matrix

| Route | HTTP Method | Access Level | Description |
|---|---|---|---|
| `/health` | `GET` | **Public** | Service operational health check |
| `/api/auth/login` | `POST` | **Public** | Admin authentication (returns signed JWT) |
| `/api/auth/me` | `GET` | **Admin Only** | Session profile & token verification |
| `/api/analytics/summary` | `GET` | **Public** | National Headline APIx & Macro KPIs |
| `/api/analytics/trend` | `GET` | **Public** | 30-day macro inflation time-series |
| `/api/analytics/elasticity` | `GET` | **Admin Only** | Lead-time elasticity ($T+1$ to $T+45$) |
| `/api/analytics/fare-decomposition` | `GET` | **Admin Only** | Unbundled fee & ATF breakdown |
| `/api/analytics/series` | `GET` | **Admin Only** | Comparative index time series |
| `/api/routes` | `GET` | **Admin Only** | 42 DGCA city-pairs & traffic weights |
| `/api/routes/parity` | `GET` | **Admin Only** | Airline fare parity & HHI monopoly scores |
| `/api/logs` | `GET` | **Admin Only** | Ingestion feeds & paginated audit trails |
| `/api/logs/telemetry` | `GET` | **Admin Only** | Scraper worker cluster health |
| `/api/logs/verify-hash` | `POST` | **Admin Only** | Cryptographic SHA-256 seal verification |
| `/api/support/faqs` | `GET` | **Public** | MoSPI regulatory guidelines & FAQs |
| `/api/support/contact` | `POST` | **Public** | Technical desk ticket submission |
| `/api/ai/chat` | `POST` | **Dual-Mode** | Public: Macro answers only; Admin: Full tool calling |

---

## 7. AI Assistant Role Guardrails

The Autonomous Statistical Copilot (`/api/ai/chat`) adapts dynamically:

### When Unauthenticated (`req.user == null`):
- **System Prompt**: Enforces `PUBLIC_SYSTEM_PROMPT`. Instructs the model to exclusively answer theoretical CPI questions, explain IMF Chapter 10 guidelines (Jevons vs. Carli drift), and summarize high-level national composite numbers.
- **Tool Restriction**: Suppresses sensitive tools (`get_route_fare_stats`, `scan_anomalies_and_diagnose`, `audit_pipeline_provenance`). Only `get_live_macro_index` is exposed.
- **Refusal Enforcement**: If a public user asks for route-level data (e.g. *“What is IndiGo's fare on DEL-BOM for tomorrow?”*), the agent explicitly refuses:
  > *"Access to route-specific fare statistics, advance purchase elasticity horizons, surge anomaly diagnostics, and cryptographic audit logs requires Admin authentication. Please log in as an administrator to access sensitive corridor intelligence."*

### When Authenticated (`req.user.role === 'ADMIN'`):
- **System Prompt**: Uses `ADMIN_SYSTEM_PROMPT` with senior economist credentials.
- **Tool Execution**: Full autonomous access to all 4 diagnostic tools.

---

## 8. Frontend Integration

1. **State Persistence**: On successful login via `POST /api/auth/login`, the client saves the JWT into `localStorage.getItem('apix_admin_token')`.
2. **Navigation Filtering**:
   - **Public View**: Only **National Overview** and **Help & Support** tabs are visible in the sidebar navigation.
   - **Admin View**: Unlocks all 7 navigation tabs, including Route Analysis, Index Series, Price Forecasting, Ingestion & Audit, and Methodology.
3. **Route Guards (`<ProtectedRoute>`):** Direct URL navigation to protected views is intercepted; unauthenticated visitors are redirected or presented with an authorization modal.
4. **Header Controls**:
   - Unauthenticated: Displays **Admin Login** button.
   - Authenticated: Displays **Admin** badge and **Logout** button.
