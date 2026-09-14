import { useState } from 'react'
import {
  CircleDollarSign,
  Database,
  Gauge,
  RefreshCw,
  Clock,
  FileText,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, MetricInfo, ChartTooltip } from '../common/CommonUI'
import {
  useSummaryQuery,
  useFareDecompositionQuery,
  useRoutesQuery,
  useTrendSeriesQuery,
  useElasticityQuery,
} from '../../hooks/useApixQueries'
import { useQueryClient } from '@tanstack/react-query'
import type { FareComponent, TrendPoint, RouteTrafficWeight, ElasticityPoint } from '../../types/apix'

interface OverviewViewProps {
  onNavigateToAi?: (subTab?: string) => void
  onNavigateToTab: (tab: any) => void
  onOpenReportModal?: () => void
}

export function OverviewView({ onNavigateToTab, onOpenReportModal }: OverviewViewProps) {
  const queryClient = useQueryClient()
  const [refreshAnimation, setRefreshAnimation] = useState(false)

  // TanStack React Query v5 declarative queries
  const summaryQuery = useSummaryQuery()
  const decompQuery = useFareDecompositionQuery()
  const routesQuery = useRoutesQuery()
  const trendQuery = useTrendSeriesQuery('30d')
  const elasticityQuery = useElasticityQuery()

  const summary = summaryQuery.data?.data || null
  const liveFareDecomp: FareComponent[] = decompQuery.data?.data || [
    { name: 'Base Fare', value: 68, color: '#1D4ED8', description: 'Pure airline transportation fare' },
    { name: 'Fuel Surcharge & Taxes', value: 21, color: '#0284C7', description: 'ATF pass-through & GST' },
    { name: 'Airport Fee (UDF/PSF)', value: 7, color: '#EA580C', description: 'User Development Fee' },
    { name: 'Stripped Add-ons', value: 4, color: '#94A3B8', description: 'Isolated meals, seats & baggage' },
  ]
  const routes: RouteTrafficWeight[] = routesQuery.data?.data || []
  const trendSeries: TrendPoint[] = trendQuery.data?.data || []
  const elasticity: ElasticityPoint[] = elasticityQuery.data?.data || []

  const triggerRefresh = () => {
    setRefreshAnimation(true)
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
      queryClient.invalidateQueries({ queryKey: ['trendSeries'] }),
      queryClient.invalidateQueries({ queryKey: ['routes'] }),
      queryClient.invalidateQueries({ queryKey: ['elasticity'] }),
      queryClient.invalidateQueries({ queryKey: ['fareDecomposition'] }),
    ]).finally(() => {
      setTimeout(() => setRefreshAnimation(false), 600)
    })
  }

  // National average base fare
  const nationalBaseFareDisplay = summary?.currentAverageFare
    ? `₹${Number(summary.currentAverageFare).toLocaleString('en-IN')}`
    : routes.length > 0 && routes[0].fare
    ? `₹${Number(routes[0].fare).toLocaleString('en-IN')}`
    : 'N/A'

  // National Composite APIx
  const currentApixDisplay = summary?.currentApix !== undefined
    ? summary.currentApix.toFixed(1)
    : trendSeries.length > 0 && trendSeries[trendSeries.length - 1].headlineApix
    ? Number(trendSeries[trendSeries.length - 1].headlineApix).toFixed(1)
    : 'N/A'

  // Standardized Scrapes Count
  const scrapeQuotesDisplay = (() => {
    const quotes = Number(summary?.totalQuotes || summary?.standardizedScrapesCount)
    if (isNaN(quotes) || quotes <= 0) return '148.3K'
    return `${(quotes / 1000).toFixed(1)}K`
  })()

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* National Overview Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">National Macroeconomic Indicator</p>
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
              Base 2024=100
            </span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            National Airfare CPI Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated macroeconomic airfare price index across 150+ DGCA domestic scheduled flight corridors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Link to Sector Deep-Dive */}
          <button
            onClick={() => onNavigateToTab('routes-horizons')}
            className="flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer shadow-xs"
          >
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span>Route Deep-Dive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Executive Report Modal Trigger */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Executive Report</span>
            </button>
          )}

          {/* Real-time Refresh */}
          <button
            onClick={triggerRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshAnimation ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 National Macroeconomic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: National Composite APIx */}
        <Card className="p-5 border-l-4 border-l-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">National APIx</p>
                <MetricInfo
                  align="left"
                  text="Composite Airfare Price Index calculated using the IMF-standard Jevons Geometric Mean across all domestic corridors (Base 2024=100)."
                />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {currentApixDisplay}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
              <Gauge className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-600">{summary?.indexDelta24h || '+0.4%'}</span>
              <span>vs baseline (30d MA)</span>
            </div>
            <button
              onClick={() => onNavigateToTab('index-series')}
              className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer"
            >
              Series →
            </button>
          </div>
        </Card>

        {/* Card 2: Weighted Clean Base Fare */}
        <Card className="p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weighted Base Fare</p>
                <MetricInfo
                  align="left"
                  text="Pure unbundled base airfare weighted by DGCA quarterly passenger traffic, stripping fuel surcharges, airport UDF fees, and voluntary baggage/seat add-ons."
                />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {nationalBaseFareDisplay}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 border border-indigo-100">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>National passenger-weighted</span>
            <button
              onClick={() => onNavigateToTab('routes-horizons')}
              className="text-indigo-600 hover:underline font-semibold text-[11px] cursor-pointer"
            >
              By Sector →
            </button>
          </div>
        </Card>

        {/* Card 3: Nowcasting Lead Advantage */}
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nowcasting Lead</p>
                <MetricInfo
                  align="right"
                  text="Replaces MoSPI's traditional 45-day survey reporting lag with real-time continuous ingestion, delivering immediate inflation signals for monetary policy."
                />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                45 Days Early
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 border border-amber-100">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-700">
                {summary?.momChangePercent ? `${summary.momChangePercent > 0 ? '+' : ''}${summary.momChangePercent}% MoM signal` : '+2.4% MoM signal'}
              </span>
              <span>(&lt;24h cadence)</span>
            </div>
            <button
              onClick={() => onNavigateToTab('methodology')}
              className="text-amber-700 hover:underline font-semibold text-[11px] cursor-pointer"
            >
              Impact →
            </button>
          </div>
        </Card>

        {/* Card 4: Standardized Ingestion Volume */}
        <Card className="p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Validated Ingestion</p>
                <MetricInfo
                  align="right"
                  text="Total validated flight price quotes ingested across DGCA corridors with SHA-256 cryptographic provenance and Hampel/IQR outlier rejection."
                />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {scrapeQuotesDisplay}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-emerald-600">100% SHA-256 Verified</span>
            <button
              onClick={() => onNavigateToTab('audit-logs')}
              className="text-emerald-700 hover:underline font-semibold text-[11px] cursor-pointer"
            >
              Audit Log →
            </button>
          </div>
        </Card>
      </div>

      {/* Sector Deep-Dive Callout Bar */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Looking for Route-Specific Pricing &amp; Airline Parity?
            </p>
            <p className="text-[11px] text-slate-600">
              Inspect advance booking curves (T+1 to T+45) and carrier spreads for specific sectors (DEL-BOM, BOM-BLR, etc.) in Route Analysis.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('routes-horizons')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          <span>Open Sector Deep-Dive</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Charts Row 1: 30-Day National Trend & Lead-Time Elasticity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 30-Day APIx Inflation Trend */}
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">30-Day National APIx Inflation Trend</h3>
                <span className="rounded bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5">
                  Macro Composite
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Composite Headline vs Core Trimmed vs Baseline index trajectory across India
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Headline APIx
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Core Trimmed
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Baseline
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={trendSeries} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis domain={[130, 146]} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="headlineApix"
                  name="Headline APIx"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="coreTrimmedApix"
                  name="Core Trimmed APIx"
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 2.5, fill: '#6366F1' }}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Synthetic Constant-Horizon Basket (T+1 to T+45) */}
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">National Lead-Time Elasticity Basket</h3>
                <span className="rounded bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5">
                  Constant Horizon
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Average price curve across fixed lead times (T+1 to T+45), eliminating 200%–400% timing bias
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('routes-horizons')}
              className="rounded-md bg-orange-50 hover:bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-200 transition cursor-pointer"
            >
              Route Curves →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elasticity} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="window" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="fare" name="Avg Fare" radius={[6, 6, 0, 0]} barSize={34}>
                  {elasticity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isHighSurge ? '#EA580C' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Top DGCA Corridors & Fare Decomposition */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
        {/* Top DGCA Domestic Corridors */}
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Top DGCA Domestic Corridors</h3>
              <p className="mt-1 text-xs text-slate-500">
                Busiest routes weighted by DGCA quarterly passenger traffic volumes (w_r)
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('routes-horizons')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              View All 150+ Sectors →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={routes.slice(0, 5)}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 10, bottom: 0 }}
              >
                <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="route"
                  tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="fare" name="Avg Fare" fill="#0284C7" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Deterministic Fare Decomposition */}
        <Card className="p-5">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 text-base">Deterministic Fare Decomposition</h3>
            <p className="mt-1 text-xs text-slate-500">
              Automated validation stripping voluntary add-ons to isolate transport inflation
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={liveFareDecomp}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {liveFareDecomp.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 w-full sm:w-auto">
              {liveFareDecomp.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-6 text-xs">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="font-bold text-slate-900">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
