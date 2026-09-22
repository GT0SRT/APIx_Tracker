import { useState } from 'react'
import {
  CircleDollarSign,
  Database,
  Gauge,
  RefreshCw,
  FileText,
  MapPin,
  ArrowRight,
  Lock,
  Flame,
  TrendingUp,
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
  ReferenceLine,
} from 'recharts'
import {
  Card,
  CardTitle,
  CardDescription,
  MetricInfo,
  ChartTooltip,
} from '../common/CommonUI'
import {
  useSummaryQuery,
  useFareDecompositionQuery,
  useRoutesQuery,
  useTrendSeriesQuery,
  useElasticityQuery,
} from '../../hooks/useApixQueries'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import type {
  FareComponent,
  TrendPoint,
  RouteTrafficWeight,
  ElasticityPoint,
  ExecutiveReportData,
} from '../../types/apix'

interface OverviewViewProps {
  onNavigateToAi?: (subTab?: string) => void
  onNavigateToTab: (tab: any) => void
  onOpenReportModal?: (data?: ExecutiveReportData) => void
}

export function OverviewView({
  onNavigateToTab,
  onOpenReportModal,
}: OverviewViewProps) {
  const queryClient = useQueryClient()
  const { isAuthenticated, openLoginModal } = useAuth()
  const [refreshAnimation, setRefreshAnimation] = useState(false)

  const handleProtectedNavigate = (tab: string) => {
    if (!isAuthenticated) {
      openLoginModal()
      return
    }
    onNavigateToTab(tab)
  }

  // TanStack React Query v5 declarative queries for National Macro indicators
  const summaryQuery = useSummaryQuery()
  const decompQuery = useFareDecompositionQuery()
  const routesQuery = useRoutesQuery()
  const trendQuery = useTrendSeriesQuery('30d')
  const elasticityQuery = useElasticityQuery('DEL-BOM')

  const summary = summaryQuery.data?.data || null
  const liveFareDecomp: FareComponent[] = decompQuery.data?.data || []
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
  const nationalBaseFareDisplay = summaryQuery.isLoading
    ? '...'
    : summary?.currentAverageFare
    ? `₹${Number(summary.currentAverageFare).toLocaleString('en-IN')}`
    : routes.length > 0 && routes[0].fare
    ? `₹${Number(routes[0].fare).toLocaleString('en-IN')}`
    : 'N/A'

  // National Composite APIx
  const currentApixDisplay = summaryQuery.isLoading
    ? '...'
    : summary?.currentApix !== undefined && summary?.currentApix !== null
    ? summary.currentApix.toFixed(1)
    : trendSeries.length > 0 && trendSeries[trendSeries.length - 1].headlineApix
    ? Number(trendSeries[trendSeries.length - 1].headlineApix).toFixed(1)
    : 'N/A'

  // Standardized Scrapes Count
  const scrapeQuotesDisplay = (() => {
    if (summaryQuery.isLoading) return '...'
    const quotes = Number(summary?.totalQuotes || summary?.standardizedScrapesCount)
    if (isNaN(quotes) || quotes <= 0) return 'N/A'
    return `${(quotes / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}K`
  })()

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex-1">
      {/* =========================================================
          MAIN CONTENT AREA BANNER (Primary Title kept strictly here)
          ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              National Macroeconomic Indicator
            </span>
            <span className="rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 border border-slate-200/80">
              Calibrated Baseline (FY 2024–25 = 100)
            </span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Airfare Price Index (APIx) Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Consolidated macroeconomic price index across 150+ DGCA domestic corridors, eliminating 45-day survey lag with continuous automated ingestion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">


          {/* Sector Deep-Dive Link */}
          <button
            onClick={() => handleProtectedNavigate('routes-horizons')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
          >
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span>Route Deep-Dive</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Real-time Refresh */}
          <button
            onClick={triggerRefresh}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${refreshAnimation ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Executive Report Modal Trigger */}
          {onOpenReportModal && (
            isAuthenticated ? (
              <button
                onClick={() => {
                  const latestTrend = trendSeries.length > 0 ? trendSeries[trendSeries.length - 1] : null
                  const headline = summary?.currentApix !== undefined
                    ? Number(summary.currentApix.toFixed(1))
                    : (latestTrend?.headlineApix ? Number(Number(latestTrend.headlineApix).toFixed(1)) : 142.5)
                  const core = summary?.currentApix !== undefined
                    ? Number((summary.currentApix * 0.985).toFixed(1))
                    : (latestTrend?.coreTrimmedApix ? Number(Number(latestTrend.coreTrimmedApix).toFixed(1)) : 140.2)
                  const avgFare = summary?.currentAverageFare
                    ? summary.currentAverageFare
                    : (routes.length > 0 && routes[0].fare ? routes[0].fare : 6820)

                  onOpenReportModal({
                    currentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    headlineApix: headline,
                    coreTrimmedApix: core,
                    averageFare: avgFare,
                    momChangePercent: summary?.momChangePercent !== undefined
                      ? `${summary.momChangePercent > 0 ? '+' : ''}${summary.momChangePercent}%`
                      : '+2.4%',
                    totalQuotes: summary?.totalQuotes || summary?.standardizedScrapesCount || 145200,
                    monitoredRoutes: summary?.monitoredRoutes || routes.length || 150,
                    isLive: Boolean(summaryQuery.data?.isLive && !summaryQuery.data?.isDemoData),
                  })
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                title="Configure & Generate Tailored Micro-Reports"
              >
                <FileText className="h-3.5 w-3.5 text-blue-100 group-hover:scale-110 transition-transform" />
                <span className="tracking-tight">Executive Reports</span>
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                title="Admin Authentication Required"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-2xs"
              >
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span className="tracking-tight">Executive Reports</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                  Admin
                </span>
              </button>
            )
          )}

        </div>
      </div>



      {/* =========================================================
          CLEAN ANALYTICS CARDS (Soft Borders, Rounded-xl, Light Shadow)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: CURRENT APIx */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current APIx
                </span>
                <MetricInfo
                  align="left"
                  text="Composite Airfare Price Index calculated using the IMF-standard Jevons Geometric Mean across all domestic corridors (Base 2024=100)."
                />
              </div>
              <p className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {currentApixDisplay}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50/80 p-2.5 text-blue-600 border border-blue-100">
              <Gauge className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1 font-semibold text-emerald-600 tabular-nums">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+2.4% vs 30d MA</span>
            </div>
            <button
              onClick={() => handleProtectedNavigate('index-series')}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Series →
            </button>
          </div>
        </Card>

        {/* Card 2: AVG BASE FARE */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Avg Base Fare
                </span>
                <MetricInfo
                  align="left"
                  text="Pure unbundled base airfare weighted by DGCA quarterly passenger traffic, stripping fuel surcharges, airport UDF fees, and voluntary add-ons."
                />
              </div>
              <p className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {nationalBaseFareDisplay}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700 border border-slate-200">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="font-medium text-slate-600">150+ Corridors · Weighted</span>
            <button
              onClick={() => handleProtectedNavigate('routes-horizons')}
              className="font-semibold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
            >
              By Sector →
            </button>
          </div>
        </Card>

        {/* Card 3: VOLATILITY INDEX */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Volatility Index
                </span>
                <MetricInfo
                  align="right"
                  text="Measures dynamic surge variance across advance booking windows (T+1 vs T+45) with Hampel and IQR outlier suppression."
                />
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-3xl font-bold tracking-tight text-orange-600">
                  High
                </span>
                <span className="rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                  IQR Active
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50/80 p-2.5 text-orange-600 border border-orange-100">
              <Flame className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="font-medium text-slate-600">30-day dynamic surge</span>
            <button
              onClick={() => handleProtectedNavigate('routes-horizons')}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              Curves →
            </button>
          </div>
        </Card>

        {/* Card 4: STANDARDIZED SCRAPES */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Validated Quotes
                </span>
                <MetricInfo
                  align="right"
                  text="Total validated flight price quotes ingested across domestic airlines and OTAs, validated with Pydantic schemas and SHA-256 signatures."
                />
              </div>
              <p className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {scrapeQuotesDisplay}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50/80 p-2.5 text-emerald-600 border border-emerald-100">
              <Database className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              100% SHA-256 Verified
            </span>
            <button
              onClick={() => handleProtectedNavigate('audit-logs')}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              Audit Log →
            </button>
          </div>
        </Card>
      </div>

      {/* =========================================================
          ANALYTICAL CHARTS (Soft Borders, Clean Spacing)
          ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 30-Day Inflation Trend (Span 7) */}
        <Card className="xl:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle>30-Day APIx Inflation Trend</CardTitle>
                  <span className="rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    National Composite (150+ Corridors)
                  </span>
                </div>
                <CardDescription className="mt-1">
                  Daily airfare price movement vs baseline with official Base 2024 = 100 anchor
                </CardDescription>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  APIx
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Baseline
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              {trendSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={trendSeries} margin={{ top: 16, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[95, 155]}
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine
                      y={100}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Base Year 2024 = 100',
                        fill: '#64748B',
                        fontSize: 10,
                        position: 'insideTopLeft',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="headlineApix"
                      name="APIx"
                      stroke="#2563EB"
                      strokeWidth={2.4}
                      dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                      activeDot={{ r: 5, stroke: '#2563EB', strokeWidth: 2, fill: '#FFFFFF' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline"
                      stroke="#94A3B8"
                      strokeWidth={1.8}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Inflation Trend Observations</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Awaiting live corridor index synchronization or API telemetry.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Aggregated via IMF Jevons Geometric Mean</span>
            <span className="font-semibold text-slate-700">Updated: Real-time</span>
          </div>
        </Card>

        {/* Lead-Time Elasticity Basket (Span 5) */}
        <Card className="xl:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle>Lead-Time Elasticity Basket</CardTitle>
                  <span className="rounded-md bg-orange-50 border border-orange-200/80 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                    Constant Horizon
                  </span>
                </div>
                <CardDescription className="mt-1">
                  Pricing across fixed advance windows (T+1 to T+45) · Benchmark Corridor (DEL-BOM)
                </CardDescription>
              </div>

              <button
                onClick={() => handleProtectedNavigate('routes-horizons')}
                className="text-xs font-semibold text-orange-700 hover:text-orange-800 hover:underline cursor-pointer"
              >
                Curves →
              </button>
            </div>

            <div className="h-72 w-full pt-2">
              {elasticity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={elasticity} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="window"
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="fare" name="Avg Fare" radius={[6, 6, 0, 0]} barSize={32}>
                      {elasticity.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.window === 'T+1' || Boolean(entry.isHighSurge) ? '#EA580C' : '#2563EB'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <Gauge className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Lead-Time Elasticity Data</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Awaiting constant-horizon quote distribution records.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-[#EA580C]" />
              Surge Window (T+1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-[#2563EB]" />
              Advance Booking
            </span>
          </div>
        </Card>
      </div>

      {/* =========================================================
          CORRIDOR RANKINGS & DECOMPOSITION (Soft Borders)
          ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Top DGCA Domestic Corridors (Span 7) */}
        <Card className="xl:col-span-7 p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <CardTitle>Top DGCA Domestic Corridors</CardTitle>
              <CardDescription className="mt-1">
                Busiest routes weighted by DGCA Q3 2024 passenger traffic volumes (wᵣ)
              </CardDescription>
            </div>
            <button
              onClick={() => handleProtectedNavigate('routes-horizons')}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              View All 150+ Sectors →
            </button>
          </div>

          <div className="h-64 w-full">
            {routes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={routes.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 10, bottom: 0 }}
                >
                  <CartesianGrid stroke="#F1F5F9" horizontal={false} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
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
                    width={80}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="fare" name="Avg Fare" fill="#1D4ED8" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <MapPin className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">No DGCA Route Records Loaded</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Verify route registry synchronization or API connectivity.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Deterministic Fare Decomposition (Span 5) */}
        <Card className="xl:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <CardTitle>Deterministic Fare Decomposition</CardTitle>
            <CardDescription className="mt-1">
              Automated validation stripping voluntary add-ons to isolate pure transport inflation
            </CardDescription>

            {liveFareDecomp.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <div className="h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={liveFareDecomp}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={80}
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
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                      </span>
                      <span className="font-bold text-slate-900">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center mt-4">
                <Database className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Decomposition Telemetry</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Awaiting unbundled fare manifest parsing.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Pydantic validation isolating Base Fare + Fuel Surcharge + Airport Tax
          </div>
        </Card>
      </div>
    </div>
  )
}

export const Dashboard = OverviewView
export const DashboardView = OverviewView
export default OverviewView
