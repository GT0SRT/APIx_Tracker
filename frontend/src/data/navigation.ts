import {
  LayoutDashboard,
  TrendingUp,
  PlaneTakeoff,
  Database,
  Sigma,
  Sparkles,
  HelpCircle,
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
    label: 'National Overview',
    icon: LayoutDashboard,
    desc: 'Executive inflation dashboard and national macroeconomic key indicators',
  },
  {
    id: 'routes-horizons',
    label: 'Route Analysis',
    icon: PlaneTakeoff,
    desc: 'Sector-specific deep dive, advance elasticity (T+1 to T+45), and airline price parity',
    badge: 'T+1 to T+45',
  },
  {
    id: 'index-series',
    label: 'Index Series',
    icon: TrendingUp,
    desc: 'Headline vs Core Trimmed APIx, MoSPI CPI 2024 linking, and time-series',
    badge: 'Core Trimmed',
  },
  {
    id: 'ai-intelligence',
    label: 'Price Forecasting',
    icon: Sparkles,
    desc: '45-Day lead-time predictive forecasting across constant purchase horizons (T+1 to T+45)',
    badge: 'Predictive',
  },
  {
    id: 'audit-logs',
    label: 'Ingestion & Audit',
    icon: Database,
    desc: 'Automated price ingestion telemetry, Hampel/IQR outlier rejection & SHA-256 audit logs',
    badge: 'SHA-256',
  },
  {
    id: 'methodology',
    label: 'Methodology & Formulas',
    icon: Sigma,
    desc: 'Two-tier IMF Jevons & Laspeyres formulas and multi-stakeholder dividends',
  },
  {
    id: 'help-support',
    label: 'Help & Support',
    icon: HelpCircle,
    desc: 'MoSPI regulatory documentation, CPI methodology guidelines, and support desk',
  },
]
