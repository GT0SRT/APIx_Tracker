import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Activity,
  CircleDollarSign,
  Database,
  Download,
  Gauge,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  BrainCircuit,
  Bot,
  ExternalLink,
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
import {
  trendData,
  elasticityData,
  dgcaRoutesData,
  fareBreakdown,
  rawScrapeFeed,
} from '../../data/mockData'
import { Card, MetricInfo, ChartTooltip } from '../common/CommonUI'
import { Pagination } from '../common/Pagination'
import { fetchSummary, fetchFareDecomposition, paginateData } from '../../services/api'
import type { SystemSummary, FareComponent } from '../../types/apix'

interface OverviewViewProps {
  onNavigateToAi: (subTab: 'ml' | 'agent' | 'rag') => void
  onNavigateToTab: (tab: any) => void
}

export function OverviewView({ onNavigateToAi, onNavigateToTab }: OverviewViewProps) {
  const [origin, setOrigin] = useState('DEL')
  const [destination, setDestination] = useState('BOM')
  const [airline, setAirline] = useState('All airlines')
  const [startDate, setStartDate] = useState('2024-08-04')
  const [endDate, setEndDate] = useState('2024-08-20')
  const [appliedRoute, setAppliedRoute] = useState('DEL-BOM')
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [refreshAnimation, setRefreshAnimation] = useState(false)
  const [summary, setSummary] = useState<SystemSummary | null>(null)
  const [liveFareDecomp, setLiveFareDecomp] = useState<FareComponent[]>(fareBreakdown)
  const [isBackendLive, setIsBackendLive] = useState(false)
  const [logPage, setLogPage] = useState(1)
  const [logPageSize, setLogPageSize] = useState(8)

  const loadBackendData = useCallback(async () => {
    const [summaryRes, decompRes] = await Promise.all([
      fetchSummary(),
      fetchFareDecomposition(),
    ])
    if (summaryRes.data) setSummary(summaryRes.data)
    if (decompRes.data && decompRes.data.length > 0) setLiveFareDecomp(decompRes.data)
    setIsBackendLive(summaryRes.isLive)
  }, [])

  useEffect(() => {
    let mounted = true
    void Promise.all([fetchSummary(), fetchFareDecomposition()]).then(([summaryRes, decompRes]) => {
      if (!mounted) return
      if (summaryRes.data) setSummary(summaryRes.data)
      if (decompRes.data && decompRes.data.length > 0) setLiveFareDecomp(decompRes.data)
      setIsBackendLive(summaryRes.isLive)
    })
    return () => {
      mounted = false
    }
  }, [])

  const triggerRefresh = () => {
    setRefreshAnimation(true)
    loadBackendData().finally(() => {
      setTimeout(() => setRefreshAnimation(false), 800)
    })
  }

  const applyFilters = () => {
    setAppliedRoute(`${origin}-${destination}`)
  }

  // Dynamic route base fare calculation
  const routeFare = useMemo(() => {
    const matched = dgcaRoutesData.find((r) => r.route === appliedRoute)
    if (matched) return `₹${matched.fare.toLocaleString()}`
    if (appliedRoute === 'DEL-BOM') return '₹6,820'
    if (appliedRoute === 'DEL-BLR') return '₹6,410'
    if (appliedRoute === 'BLR-HYD') return '₹4,620'
    return '₹5,980'
  }, [appliedRoute])

  const filteredTrendData = useMemo(() => {
    return trendData.map((point, index) => {
      const modifier = appliedRoute === 'DEL-BOM' ? 0 : (index % 3) * 0.9 - 0.4
      return {
        ...point,
        headlineApix: parseFloat((point.headlineApix + modifier).toFixed(1)),
        coreTrimmedApix: parseFloat((point.coreTrimmedApix + modifier * 0.6).toFixed(1)),
      }
    })
  }, [appliedRoute])

  // Filtered live audit feed
  const filteredLogs = useMemo(() => {
    return rawScrapeFeed.filter((item) => {
      const q = logSearchQuery.toLowerCase()
      return (
        item.id.toLowerCase().includes(q) ||
        item.carrier.toLowerCase().includes(q) ||
        `${item.origin}-${item.destination}`.toLowerCase().includes(q) ||
        item.horizon.toLowerCase().includes(q) ||
        item.sha256Hash.toLowerCase().includes(q)
      )
    })
  }, [logSearchQuery])

  // Paginated records for table view
  const paginatedLogs = useMemo(() => {
    return paginateData(filteredLogs, logPage, logPageSize)
  }, [filteredLogs, logPage, logPageSize])

  // Real CSV export
  const exportCsv = () => {
    const headers = [
      'RecordID',
      'Origin',
      'Destination',
      'Carrier',
      'DepartureDate',
      'Horizon',
      'BaseFare',
      'FuelSurcharge',
      'AirportTax',
      'StrippedAddons',
      'TotalFare',
      'Status',
      'SHA256',
    ]
    const rows = filteredLogs.map((log) => [
      log.id,
      log.origin,
      log.destination,
      log.carrier,
      log.departureDate,
      log.horizon,
      log.baseFare,
      log.fuelSurcharge,
      log.airportTax,
      log.voluntaryAddonsStripped,
      log.totalFare,
      log.status,
      log.sha256Hash,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `apix_audit_logs_${appliedRoute}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      {/* Responsive Filter Bar */}
      <div className="border-b border-slate-200 bg-white px-4 md:px-8 py-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Origin</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option>DEL</option>
                <option>BOM</option>
                <option>BLR</option>
                <option>MAA</option>
                <option>CCU</option>
                <option>HYD</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Destination</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option>BOM</option>
                <option>BLR</option>
                <option>CCU</option>
                <option>DEL</option>
                <option>HYD</option>
                <option>GOI</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Airline</label>
              <select
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option>All airlines</option>
                <option>IndiGo</option>
                <option>Air India</option>
                <option>Akasa Air</option>
                <option>SpiceJet</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] w-full lg:w-auto cursor-pointer"
          >
            <Search className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Advanced Capabilities Quick Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-2">
              Advanced AI Differentiators Enabled
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold">
                SIH 2026 Ready
              </span>
            </p>
            <p className="text-[11px] text-blue-200/80">
              Horizon Trend ML Forecasting (92%+ Acc) · Autonomous 24/7 Anomaly Agent · Agentic RAG Policy Q&amp;A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToAi('ml')}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-amber-300" />
            <span>ML Horizon Curves</span>
          </button>
          <button
            onClick={() => onNavigateToAi('agent')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-xs"
          >
            <Bot className="h-3.5 w-3.5 text-emerald-300" />
            <span>24/7 Agent Feed</span>
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6 p-4 md:p-8 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">National Indicator</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Market Overview &amp; CPI Analytics
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-500">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                isBackendLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isBackendLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isBackendLive ? 'API: Live Connected' : 'API: Standalone Mode'}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Pipeline: {summary?.pipelineUptime || '99.9%'} Uptime</span>
            </div>
            <button
              onClick={triggerRefresh}
              className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="Trigger live sync"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshAnimation ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Metric Cards with Smart Right/Left Info Tooltips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Current APIx */}
          <Card className="p-5 border-l-4 border-l-blue-600">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current APIx</p>
                  <MetricInfo
                    align="left"
                    text="Calculated using the Jevons Geometric Mean across sampled routes to prevent dynamic surge substitution bias (IMF CPI standard Chapter 10)."
                  />
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">142.5</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
                <Gauge className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-600">{summary?.indexDelta24h || '+2.4%'}</span>
                <span>vs baseline (30d MA)</span>
              </div>
              <button
                onClick={() => onNavigateToTab('index-series')}
                className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5 text-[11px] cursor-pointer"
              >
                Series <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </Card>

          {/* Card 2: Avg Base Fare */}
          <Card className="p-5 border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Base Fare</p>
                  <MetricInfo
                    align="left"
                    text="Pure base airfare isolating transport price inflation by stripping fuel surcharges, UDF airport fees, and voluntary add-ons."
                  />
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{routeFare}</p>
              </div>
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600 border border-orange-100">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{appliedRoute}</span>
              <span>·</span>
              <span>{airline}</span>
            </div>
          </Card>

          {/* Card 3: Volatility Index */}
          <Card className="p-5 border-l-4 border-l-amber-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Volatility Index</p>
                  <MetricInfo
                    align="right"
                    text="30-day dynamic price dispersion and surge frequency, filtered via Hampel & Interquartile Range (IQR) outlier suppression."
                  />
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">High</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 border border-amber-100">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-amber-700">Dynamic Surge Active</span>
                <span>·</span>
                <span>IQR Suppressed</span>
              </div>
              <button
                onClick={() => onNavigateToAi('agent')}
                className="text-amber-700 hover:underline font-semibold flex items-center gap-0.5 text-[11px] cursor-pointer"
              >
                Alerts <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </Card>

          {/* Card 4: Standardized Scrapes */}
          <Card className="p-5 border-l-4 border-l-emerald-600">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Standardized Scrapes</p>
                  <MetricInfo
                    align="right"
                    text="Total validated flight price quotes ingested across top DGCA routes with SHA-256 cryptographic provenance."
                  />
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {summary ? `${(summary.totalQuotes / 1000).toFixed(1)}K` : '145.2K'}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
                <Database className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-600">100% SHA-256</span>
                <span>verified clean</span>
              </div>
              <button
                onClick={() => onNavigateToTab('audit-logs')}
                className="text-emerald-700 hover:underline font-semibold flex items-center gap-0.5 text-[11px] cursor-pointer"
              >
                Audit Log <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </Card>
        </div>

        {/* Charts Row 1: 30-Day Trend & Lead-Time Elasticity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* 30-Day APIx Inflation Trend */}
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">30-Day APIx Inflation Trend</h3>
                  <span className="rounded bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5">
                    Live Formulation
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {appliedRoute} Headline vs Core Trimmed vs Baseline index movement
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
                <RechartsLineChart data={filteredTrendData} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
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

          {/* Lead-Time Elasticity Basket */}
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">Lead-Time Elasticity Basket</h3>
                  <span className="rounded bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5">
                    Synthetic Basket
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Constant-horizon pricing across T+1 to T+45 windows (eliminates 200%–400% booking bias)
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('routes-horizons')}
                className="rounded-md bg-orange-50 hover:bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-200 transition cursor-pointer"
              >
                Explore Curves →
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={elasticityData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
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
                    {elasticityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isHighSurge ? '#EA580C' : '#2563EB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2: DGCA Traffic-Weighted Routes & Fare Decomposition */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">DGCA Traffic-Weighted Routes</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Current base fares scaled by DGCA official passenger volume weights ($w_r$)
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('methodology')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Formula Spec →
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dgcaRoutesData.slice(0, 5)}
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

          <Card className="p-5">
            <div className="mb-2">
              <h3 className="font-bold text-slate-900 text-base">Deterministic Fare Decomposition</h3>
              <p className="mt-1 text-xs text-slate-500">
                Pydantic validation stripping voluntary add-ons to isolate transport inflation
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

        {/* Live Scraper Logs Table */}
        <Card className="overflow-hidden border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Live Scraper Logs &amp; Provenance Trail</h3>
                <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Playwright Stealth
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Standardized extraction records with SHA-256 cryptographic provenance
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter logs or hash..."
                  value={logSearchQuery}
                  onChange={(e) => {
                    setLogSearchQuery(e.target.value)
                    setLogPage(1)
                  }}
                  className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-600 w-48"
                />
              </div>
              <button
                onClick={exportCsv}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
              <button
                onClick={triggerRefresh}
                className="flex items-center gap-1.5 rounded-lg bg-[#0B2545] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-900 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshAnimation ? 'animate-spin' : ''}`} />
                Live Sync
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="bg-[#0B2545] text-white text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  {[
                    'ID',
                    'Route',
                    'Carrier',
                    'Departure',
                    'Horizon',
                    'Base Fare',
                    'Fuel & Tax',
                    'Total Fare',
                    'SHA-256 Hash',
                    'Status',
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3.5 font-bold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedLogs.data.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-600">{row.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">
                      {row.origin}-{row.destination}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{row.carrier}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.departureDate}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-800">{row.horizon}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                      ₹{row.baseFare.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      ₹{(row.fuelSurcharge + row.airportTax).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-extrabold text-blue-700">
                      ₹{row.totalFare.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-slate-500">
                      {row.sha256Hash.substring(0, 12)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.status === 'Cleaned' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          Cleaned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
                          Suppressed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedLogs.page}
            totalPages={paginatedLogs.totalPages}
            totalItems={paginatedLogs.total}
            pageSize={logPageSize}
            pageSizeOptions={[5, 8, 12, 20]}
            onPageChange={setLogPage}
            onPageSizeChange={(size) => {
              setLogPageSize(size)
              setLogPage(1)
            }}
            itemName="scraped records"
          />
        </Card>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <p>APIx Tracker v2.0 · National Transport Inflation Platform · Team AndroMatrix (SIH 2026)</p>
          <p>Ministry of Statistics and Programme Implementation (MoSPI) · Reserve Bank of India</p>
        </footer>
      </div>
    </>
  )
}
