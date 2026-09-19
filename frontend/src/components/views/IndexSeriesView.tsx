import { useState, useMemo } from 'react'
import {
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from 'recharts'
import { Card, MetricInfo, ChartTooltip } from '../common/CommonUI'
import { Pagination } from '../common/Pagination'
import { paginateData } from '../../services/api'
import { useTrendSeriesQuery, useSummaryQuery } from '../../hooks/useApixQueries'

const historicalSeries90Days = [
  { date: 'Jun 01', headline: 129.2, coreTrimmed: 129.0, mospiLag: 126.4, baseline: 128.0 },
  { date: 'Jun 10', headline: 130.5, coreTrimmed: 130.1, mospiLag: 126.4, baseline: 128.5 },
  { date: 'Jun 20', headline: 132.8, coreTrimmed: 131.2, mospiLag: 126.4, baseline: 129.0 },
  { date: 'Jun 30', headline: 131.4, coreTrimmed: 131.0, mospiLag: 126.4, baseline: 129.5 },
  { date: 'Jul 10', headline: 133.6, coreTrimmed: 132.4, mospiLag: 127.8, baseline: 130.0 },
  { date: 'Jul 20', headline: 134.9, coreTrimmed: 133.5, mospiLag: 127.8, baseline: 130.5 },
  { date: 'Jul 30', headline: 133.8, coreTrimmed: 133.2, mospiLag: 127.8, baseline: 131.0 },
  { date: 'Aug 05', headline: 136.5, coreTrimmed: 135.1, mospiLag: 128.5, baseline: 132.3 },
  { date: 'Aug 10', headline: 139.5, coreTrimmed: 136.8, mospiLag: 128.5, baseline: 133.1 },
  { date: 'Aug 15', headline: 144.6, coreTrimmed: 138.3, mospiLag: 128.5, baseline: 133.8 }, // Surge spike
  { date: 'Aug 20', headline: 142.5, coreTrimmed: 140.1, mospiLag: 128.5, baseline: 134.8 },
]

export function IndexSeriesView() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30D' | '90D' | '1Y'>('90D')
  const [showHeadline, setShowHeadline] = useState(true)
  const [showCoreTrimmed, setShowCoreTrimmed] = useState(true)
  const [showMospiLag, setShowMospiLag] = useState(true)
  const [showTable, setShowTable] = useState(true)
  const [tablePage, setTablePage] = useState(1)
  const [tablePageSize, setTablePageSize] = useState(5)

  const tfParam = selectedTimeframe === '30D' ? '30d' : selectedTimeframe === '90D' ? '90d' : '365d'
  const { data: trendRes } = useTrendSeriesQuery(tfParam)
  const { data: summaryRes } = useSummaryQuery()

  const trendData = trendRes?.data && trendRes.data.length > 0 ? trendRes.data : []
  const summary = summaryRes?.data || null

  const rawPoints = trendData.length > 0 ? trendData : historicalSeries90Days

  const seriesData = useMemo(() => {
    return rawPoints.map((item: any, idx) => {
      const dateStr = item.date || item.timestamp || `Day ${idx + 1}`
      const hRaw = Number(item.headline ?? item.headlineApix ?? (130 + idx * 1.2))
      const cRaw = Number(item.coreTrimmed ?? item.coreTrimmedApix ?? (hRaw * 0.985))
      const mRaw = Number(item.mospiLag ?? 128.5)
      const bRaw = Number(item.baseline ?? 128.0)

      const headline = isNaN(hRaw) ? 140.0 : parseFloat(hRaw.toFixed(1))
      const coreTrimmed = isNaN(cRaw) ? 138.0 : parseFloat(cRaw.toFixed(1))
      const mospiLag = isNaN(mRaw) ? 128.5 : parseFloat(mRaw.toFixed(1))
      const baseline = isNaN(bRaw) ? 128.0 : parseFloat(bRaw.toFixed(1))

      return {
        date: typeof dateStr === 'string' && dateStr.length > 10 ? dateStr.substring(5, 10) : dateStr,
        headline,
        coreTrimmed,
        mospiLag,
        baseline,
      }
    })
  }, [rawPoints])

  const latestItem = seriesData[seriesData.length - 1]
  const headlineDisplay = latestItem
    ? latestItem.headline.toFixed(1)
    : summary?.currentApix
    ? summary.currentApix.toFixed(1)
    : 'N/A'
  const coreDisplay = latestItem
    ? latestItem.coreTrimmed.toFixed(1)
    : summary?.currentApix
    ? (summary.currentApix * 0.985).toFixed(1)
    : 'N/A'
  const mospiDisplay = latestItem ? latestItem.mospiLag.toFixed(1) : '128.5'
  const momDisplay = summary?.momChangePercent !== undefined
    ? `${summary.momChangePercent > 0 ? '+' : ''}${summary.momChangePercent}% MoM rate`
    : 'N/A'

  const paginatedSeries = useMemo(() => {
    return paginateData(seriesData, tablePage, tablePageSize)
  }, [seriesData, tablePage, tablePageSize])

  const isLive = Boolean(trendRes?.isLive && !trendRes?.isDemoData && trendData.length > 0)

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* Title & Subtitle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              APIx Time-Series &amp; Inflation Analysis
            </h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              Base 2024=100
            </span>
            {isLive ? (
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Live Data
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                Demo Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparing high-frequency real-time index series vs. traditional 45-day survey reporting
          </p>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold shadow-xs">
          {(['30D', '90D', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                selectedTimeframe === tf ? 'bg-[#0F4C81] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          MASSIVE NOWCASTING LEAD ADVANTAGE CALLOUT BLOCK
          ========================================================= */}
      <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/50 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-0.5 border border-emerald-300">
                MoSPI Statistical Modernization Breakthrough
              </span>
              <span className="text-xs font-bold text-slate-500">SIH 2026 Innovation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nowcasting Lead Advantage: <span className="text-emerald-700">+45 Days Ahead of Manual CPI</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              While traditional MoSPI field surveyors collect paper schedules subject to a 45-day compilation cycle (currently reporting lagged CPI at <strong className="text-slate-800 tabular-nums">128.5</strong>), APIx autonomously ingests high-frequency quotes every 6 hours, delivering real-time Headline APIx at <strong className="text-blue-700 tabular-nums">142.5</strong> and Core Trimmed at <strong className="text-indigo-700 tabular-nums">140.1</strong>.
            </p>
          </div>

          {/* Visual Lead-Time Advantage Gauge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">Official CPI Lag</p>
              <p className="text-2xl font-black text-slate-500 tabular-nums">45 Days</p>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Field Survey Delay</p>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">APIx Freshness</p>
              <p className="text-2xl font-black text-emerald-600 tabular-nums">&lt; 6 Hours</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Automated Ingestion</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Macro Advantage</p>
              <p className="text-3xl font-black text-[#0F4C81] tabular-nums">+45d</p>
              <p className="text-[10px] text-blue-700 font-bold mt-0.5">Nowcasting Lead</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Headline APIx</p>
                <MetricInfo text="Reflects the unfiltered Jevons index across all high-frequency quotes including dynamic holiday spikes." />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {headlineDisplay}
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>{momDisplay}</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Trimmed APIx</p>
                <MetricInfo text="24-hour trimmed geometric mean per horizon. Strips flash-sale and holiday distortion to track underlying core inflation." />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {coreDisplay}
              </p>
            </div>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-indigo-700 font-bold">
            <span>Smoothed underlying trend</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-slate-400">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">MoSPI Manual CPI</p>
                <MetricInfo text="Official traditional field-survey CPI transport index. Suffers from a 45-day reporting lag." />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-600">
                {mospiDisplay}
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-700 font-medium">
            <span>Lagging by 45 Days</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nowcasting Lead Advantage</p>
                <MetricInfo text="Days ahead of official government data release that APIx delivers actionable inflation signals." />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-700">+45 Days</p>
            </div>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Activity className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Zero-lag real-time signal</span>
          </div>
        </Card>
      </div>

      {/* Main Comparative Chart */}
      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base">
                Headline APIx vs. Core Trimmed APIx vs. MoSPI Official (45-Day Lag)
              </h3>
              {isLive ? (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Live Data
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Demo Data
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Highlighting how traditional manual collection completely misses dynamic pricing surge volatility
            </p>
          </div>

          {/* Series Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowHeadline(!showHeadline)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border transition cursor-pointer ${
                showHeadline ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Headline APIx
            </button>
            <button
              onClick={() => setShowCoreTrimmed(!showCoreTrimmed)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border transition cursor-pointer ${
                showCoreTrimmed
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Core Trimmed
            </button>
            <button
              onClick={() => setShowMospiLag(!showMospiLag)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border transition cursor-pointer ${
                showMospiLag
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              MoSPI Official (Lagged)
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          {seriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={seriesData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                {showHeadline && (
                  <Line
                    type="monotone"
                    dataKey="headline"
                    name="Headline APIx (High-Frequency)"
                    stroke="#2563EB"
                    strokeWidth={2.8}
                    dot={{ r: 4, fill: '#2563EB' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {showCoreTrimmed && (
                  <Line
                    type="monotone"
                    dataKey="coreTrimmed"
                    name="Core Trimmed APIx (Trimmed Geometric Mean)"
                    stroke="#6366F1"
                    strokeWidth={2.2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#6366F1' }}
                  />
                )}
                {showMospiLag && (
                  <Area
                    type="stepAfter"
                    dataKey="mospiLag"
                    name="MoSPI Official CPI (45-Day Manual Lag)"
                    stroke="#94A3B8"
                    fill="#F1F5F9"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <TrendingUp className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Time-Series Observations</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Awaiting historical index point records for timeframe {selectedTimeframe}.</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-slate-700 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Statistical Analysis &amp; Volatility Suppression</p>
            <p className="leading-relaxed">
              Notice the spike on August 15 (Independence Day holiday surge). The unfiltered <strong>Headline APIx</strong> captured the true +8.1% surge experienced by consumers, while the <strong>Core Trimmed APIx</strong> mathematically suppressed the ephemeral spike to track underlying cost-push inflation. Both indexes deliver actionable forward intelligence weeks ahead of traditional MoSPI manual reporting.
            </p>
          </div>
        </div>
      </Card>

      {/* Historical Series Inspection Table with Pagination */}
      <Card className="overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Historical Observation Records</h3>
            <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5">
              Paginated Data Stream
            </span>
          </div>
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            {showTable ? (
              <>Hide Table <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Show Table <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>

        {showTable && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="bg-[#0B2545] text-white text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3 font-bold">Observation Date</th>
                    <th className="px-4 py-3 font-bold">Headline APIx</th>
                    <th className="px-4 py-3 font-bold">Core Trimmed APIx</th>
                    <th className="px-4 py-3 font-bold">MoSPI Official (Lagged)</th>
                    <th className="px-4 py-3 font-bold">Nowcast Lead Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedSeries.data.map((row) => (
                    <tr key={row.date} className="hover:bg-blue-50/40 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">{row.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-extrabold text-blue-700">{row.headline}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-indigo-700">{row.coreTrimmed}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">{row.mospiLag}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-600">
                        +{Math.max(0, (Number(row.headline || 0) - Number(row.mospiLag || 0))).toFixed(1)} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={paginatedSeries.page}
              totalPages={paginatedSeries.totalPages}
              totalItems={paginatedSeries.total}
              pageSize={tablePageSize}
              pageSizeOptions={[5, 10, 15]}
              onPageChange={setTablePage}
              onPageSizeChange={(size) => {
                setTablePageSize(size)
                setTablePage(1)
              }}
              itemName="daily observations"
            />
          </>
        )}
      </Card>
    </div>
  )
}
