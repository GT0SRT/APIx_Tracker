import {
  LayoutDashboard,
  TrendingUp,
  Map,
  Database,
  Sliders,
  Sparkles,
} from 'lucide-react'
import type { TabType } from '../types/apix'

export interface NavItemConfig {
  id: TabType
  label: string
  icon: typeof LayoutDashboard
  desc: string
  badge?: string
}

export const navItems: NavItemConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    desc: 'Executive inflation dashboard and macroeconomic key indicators',
  },
  {
    id: 'index-series',
    label: 'Index Series',
    icon: TrendingUp,
    desc: 'Headline vs Core Trimmed APIx, MoSPI CPI 2024 linking, and time-series',
    badge: 'Core Trimmed',
  },
  {
    id: 'routes-horizons',
    label: 'Routes & Horizons',
    icon: Map,
    desc: 'Advance elasticity (T+1 to T+45) and CCI/DGCA regulator price parity',
  },
  {
    id: 'ai-intelligence',
    label: 'AI Intelligence Hub',
    icon: Sparkles,
    desc: 'Horizon Trend ML (92%+ Acc), 24/7 Anomaly Agent & Policy Compliance RAG',
    badge: '3 AI Models',
  },
  {
    id: 'audit-logs',
    label: 'Ingestion & Audit',
    icon: Database,
    desc: 'Playwright telemetry, Hampel/IQR outlier rejection & MoSPI DPI Gateway',
    badge: 'SHA-256',
  },
  {
    id: 'methodology',
    label: 'Methodology & Impact',
    icon: Sliders,
    desc: 'Two-tier IMF Jevons & Laspeyres formulas and multi-stakeholder dividends',
  },
]
