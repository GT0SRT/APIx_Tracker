import {
  LayoutDashboard,
  TrendingUp,
  Map,
  Table2,
  Sliders,
  BrainCircuit,
  Bot,
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
    id: 'audit-logs',
    label: 'Ingestion & Audit',
    icon: Table2,
    desc: 'Playwright telemetry, Hampel/IQR outlier rejection, and SHA-256 hashes',
    badge: 'SHA-256',
  },
  {
    id: 'methodology',
    label: 'Methodology & Weights',
    icon: Sliders,
    desc: 'IMF Jevons geometric formula, Modified Laspeyres, and weight sensitivity',
  },
  {
    id: 'ml-forecasting',
    label: 'ML Forecasting',
    icon: BrainCircuit,
    desc: 'Time-series model predicting future fare movements & surges (92%+ accuracy)',
    badge: '92%+ Acc',
  },
  {
    id: 'agentic-ai',
    label: 'Agentic AI Monitor',
    icon: Bot,
    desc: '24/7 Autonomous monitoring agents for spike detection & root-cause analysis',
    badge: '24/7 Live',
  },
]
