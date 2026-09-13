import type { AnomalyAlert } from '../types/apix'

export const agenticAnomalyAlerts: AnomalyAlert[] = [
  {
    id: 'ANOM-2024-082',
    timestamp: 'Today, 05:42 IST',
    route: 'DEL-BOM',
    carrier: 'SpiceJet',
    horizon: 'T+1',
    severity: 'Critical',
    title: 'Extreme Fare Spike (+218% vs 24h Moving Mean)',
    description: 'Fare surged from baseline ₹6,820 to ₹21,500 on SG-8169 within an 80-minute window.',
    deviationPercent: '+218%',
    rootCause:
      'Sudden flight cancellation by competitor carrier AI-804 caused dynamic pricing algorithm to automatically exhaust lowest 4 fare buckets, leaving only Y-class premium seats.',
    actionTaken:
      'Hampel Filter flagged observation as an ephemeral supply glitch. Observation quarantined from Core Trimmed APIx; preserved in raw cryptographic audit trail.',
    agentConfidence: 96.8,
    regulatoryFlag: true,
  },
  {
    id: 'ANOM-2024-081',
    timestamp: 'Today, 03:15 IST',
    route: 'DEL-IXL (Leh)',
    carrier: 'Air India / IndiGo',
    horizon: 'T+7',
    severity: 'Warning',
    title: 'Sustained Duopoly Margin Expansion (39.4% Spread)',
    description: 'Cross-airline pricing parity check detected wide spread exceeding CCI fair competition threshold.',
    deviationPercent: '+39.4%',
    rootCause:
      'High seasonal tourist influx coupled with restricted slot allocation at high-altitude Leh airport. Limited seat inventory allowing parallel algorithmic markups.',
    actionTaken:
      'Logged to CCI/DGCA Market Competition Watchlist. Alert dispatched to MoCA monitoring dashboard for capacity intervention review.',
    agentConfidence: 91.2,
    regulatoryFlag: true,
  },
  {
    id: 'ANOM-2024-079',
    timestamp: 'Yesterday, 18:22 IST',
    route: 'BOM-GOI',
    carrier: 'Akasa Air',
    horizon: 'T+30',
    severity: 'Info',
    title: 'Flash Sale Promo Tier Ingestion Trigger',
    description: 'Promotional bucket released at ₹2,199 (-48% below historical Jevons baseline).',
    deviationPercent: '-48.0%',
    rootCause:
      'Akasa Air Monsoon Flash Sale campaign for advance bookings beyond 30 days. Validated as genuine unbundled consumer fare.',
    actionTaken:
      'Approved by Pydantic schema validation. Ingested into T+30 basket using 24h trimmed geometric smoothing to prevent artificial index collapse.',
    agentConfidence: 98.4,
    regulatoryFlag: false,
  },
]

export const agentWorkflowSteps = [
  {
    step: '01',
    name: 'High-Frequency Ingestion',
    status: 'Continuous',
    description: 'Playwright stealth workers query top 150 routes across 4 domestic carriers and 3 OTAs every 6 hours.',
  },
  {
    step: '02',
    name: 'Deterministic Decomposition',
    status: 'Automated',
    description: 'Pydantic v2 schemas isolate Base Fare + Fuel Surcharge + Taxes while stripping meals, seats, and baggage.',
  },
  {
    step: '03',
    name: 'Hampel & IQR Outlier Filter',
    status: 'Real-Time',
    description: 'Identifies statistical outliers (Z-score > 3.0 & 1.5x IQR) to separate flash sales and glitches from true inflation.',
  },
  {
    step: '04',
    name: 'Autonomous Root-Cause Diagnostic',
    status: 'Agentic LLM',
    description: 'Correlates price anomalies with DGCA airport slot notices, airline fleet groundings, and calendar holidays.',
  },
  {
    step: '05',
    name: 'Immutable SHA-256 Seal',
    status: 'Verified',
    description: 'Calculates cryptographic hash for every validated record before writing to TimescaleDB audit log.',
  },
]
