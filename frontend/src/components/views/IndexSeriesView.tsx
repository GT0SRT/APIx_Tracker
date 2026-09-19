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
  { date: 'Aug 15', headline: 144.6, coreTrimmed: 138.3, mospiLag: 128.5, baseline: 133.8 },
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
  const headlineDisplay = latestItem ? latestItem.headline.toFixed(1) : summary?.currentApix ? summary.currentApix.toFixed(1) : '--'
  const coreDisplay = latestItem ? latestItem.coreTrimmed.toFixed(1) : summary?.currentApix ? (summary.currentApix * 0.985).toFixed(1) : '--'
  const mospiDisplay = latestItem ? latestItem.mospiLag.toFixed(1) : '128.5'
  const momDisplay = summary?.momChangePercent !== undefined
    ? `${summary.momChangePercent > 0 ? '+' : ''}${summary.momChangePercent}% MoM rate`
    : '+2.4% MoM rate'

  const paginatedSeries = useMemo(() => {
    return paginateData(seriesData, tablePage, tablePageSize)
  }, [seriesData, tablePage, tablePageSize])

  const isLive = Boolean(trendRes?.isLive && !trendRes?.isDemoData && trendData.length > 0)

  const cardBase = 'group relative overflow-hidden rounded-2xl !border-[#26364c] !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] text-white shadow-[0_18px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:!border-cyan-400/30 hover:shadow-[0_24px_55px_rgba(0,0,0,0.38),0_0_30px_rgba(34,211,238,0.06)]'
  const mutedText = 'text-slate-400'

  return (
    <div className="min-h-full flex-1 space-y-6 bg-[#07111f] p-4 md:p-8 text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            Index intelligence series
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              APIx Time-Series &amp; Inflation Analysis
            </h2>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-200">
              Base 2024=100
            </span>
            {isLive ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                Live Data
              </span>
            ) : (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                Demo Data
              </span>
            )}
          </div>
          <p className={`mt-1 text-xs ${mutedText}`}>
            Comparing high-frequency real-time index series vs. traditional 45-day survey reporting
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-slate-700 bg-[#0d192b] p-1 text-xs font-semibold shadow-[0_8px_24px_rgba(2,8,23,0.25)]">
          {(['30D', '90D', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setSelectedTimeframe(tf)
                setTablePage(1)
              }}
              className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                selectedTimeframe === tf
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_18px_rgba(34,211,238,0.22)]'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className={`${cardBase} p-5 border-l-4 border-l-cyan-400`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Headline APIx</p>
                <MetricInfo text="Reflects the unfiltered Jevons index across all high-frequency quotes including dynamic holiday spikes." />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{headlineDisplay}</p>
            </div>
            <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2.5 text-cyan-300 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-3 flex items-center gap-1 text-xs text-emerald-300 font-bold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>{momDisplay}</span>
          </div>
        </Card>

        <Card className={`${cardBase} p-5 border-l-4 border-l-violet-400`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-400/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Trimmed APIx</p>
                <MetricInfo text="24-hour trimmed geometric mean per horizon. Strips flash-sale and holiday distortion to track underlying core inflation." />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{coreDisplay}</p>
            </div>
            <span className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-2.5 text-violet-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-3 flex items-center gap-1 text-xs text-violet-300 font-bold">
            <span>Smoothed underlying trend</span>
          </div>
        </Card>

        <Card className={`${cardBase} p-5 border-l-4 border-l-slate-500`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-400/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">MoSPI Manual CPI</p>
                <MetricInfo text="Official traditional field-survey CPI transport index. Suffers from a 45-day reporting lag." />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-200">{mospiDisplay}</p>
            </div>
            <span className="rounded-xl border border-slate-600 bg-slate-800/80 p-2.5 text-slate-400">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-3 flex items-center gap-1 text-xs text-amber-300 font-medium">
            <span>Lagging by 45 Days</span>
          </div>
        </Card>

        <Card className={`${cardBase} p-5 border-l-4 border-l-emerald-400`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nowcasting Lead Advantage</p>
                <MetricInfo text="Days ahead of official government data release that APIx delivers actionable inflation signals." />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-300">+45 Days</p>
            </div>
            <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-300">
              <Activity className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-3 flex items-center gap-1 text-xs text-emerald-300 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Zero-lag real-time signal</span>
          </div>
        </Card>
      </div>

      {/* Main Comparative Chart */}
      <Card className={`${cardBase} p-5 md:p-6`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base">
                Headline APIx vs. Core Trimmed APIx vs. MoSPI Official (45-Day Lag)
              </h3>
              {isLive ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Live Data
                </span>
              ) : (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Demo Data
                </span>
              )}
            </div>
            <p className={`mt-1 text-xs ${mutedText}`}>
              Highlighting how traditional manual collection completely misses dynamic pricing surge volatility
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowHeadline(!showHeadline)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold border transition cursor-pointer ${
                showHeadline
                  ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Headline APIx
            </button>
            <button
              onClick={() => setShowCoreTrimmed(!showCoreTrimmed)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold border transition cursor-pointer ${
                showCoreTrimmed
                  ? 'bg-violet-400/10 text-violet-300 border-violet-400/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Core Trimmed
            </button>
            <button
              onClick={() => setShowMospiLag(!showMospiLag)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold border transition cursor-pointer ${
                showMospiLag
                  ? 'bg-slate-700/70 text-slate-200 border-slate-600'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              MoSPI Official (Lagged)
            </button>
          </div>
        </div>

        <div className="h-80 w-full rounded-xl border border-slate-800 bg-[#091525] p-2 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={seriesData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#1e3148" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#CBD5E1' }} />
              {showHeadline && (
                <Line
                  type="monotone"
                  dataKey="headline"
                  name="Headline APIx (High-Frequency)"
                  stroke="#22D3EE"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#22D3EE', stroke: '#07111f', strokeWidth: 2 }}
                  activeDot={{ r: 7, stroke: '#A5F3FC', strokeWidth: 2 }}
                />
              )}
              {showCoreTrimmed && (
                <Line
                  type="monotone"
                  dataKey="coreTrimmed"
                  name="Core Trimmed APIx (Trimmed Geometric Mean)"
                  stroke="#A78BFA"
                  strokeWidth={2.4}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: '#A78BFA' }}
                />
              )}
              {showMospiLag && (
                <Area
                  type="stepAfter"
                  dataKey="mospiLag"
                  name="MoSPI Official CPI (45-Day Manual Lag)"
                  stroke="#64748B"
                  fill="#334155"
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-xs text-slate-300 flex items-start gap-3 shadow-inner">
          <Sparkles className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Statistical Analysis &amp; Volatility Suppression</p>
            <p className="leading-relaxed text-slate-400">
              Notice the spike on August 15 (Independence Day holiday surge). The unfiltered <strong className="text-cyan-300">Headline APIx</strong> captured the true +8.1% surge experienced by consumers, while the <strong className="text-violet-300">Core Trimmed APIx</strong> mathematically suppressed the ephemeral spike to track underlying cost-push inflation. Both indexes deliver actionable forward intelligence weeks ahead of traditional MoSPI manual reporting.
            </p>
          </div>
        </div>
      </Card>

      {/* Historical Series Inspection Table */}
      <Card className={`${cardBase} overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a1627]">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-300" />
            <h3 className="font-bold text-white text-sm">Historical Observation Records</h3>
            <span className="rounded border border-slate-700 bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5">
              Paginated Data Stream
            </span>
          </div>
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1 text-xs text-cyan-300 font-semibold hover:text-cyan-200 cursor-pointer"
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
                <thead className="bg-[#111f33] text-cyan-100 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3 font-bold">Observation Date</th>
                    <th className="px-4 py-3 font-bold">Headline APIx</th>
                    <th className="px-4 py-3 font-bold">Core Trimmed APIx</th>
                    <th className="px-4 py-3 font-bold">MoSPI Official (Lagged)</th>
                    <th className="px-4 py-3 font-bold">Nowcast Lead Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0d192b]">
                  {paginatedSeries.data.map((row) => (
                    <tr key={row.date} className="hover:bg-cyan-400/[0.04] transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-200">{row.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-extrabold text-cyan-300">{row.headline}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-violet-300">{row.coreTrimmed}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-400">{row.mospiLag}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-300">
                        +{Math.max(0, (Number(row.headline || 0) - Number(row.mospiLag || 0))).toFixed(1)} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-800 bg-[#0a1627]">
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
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
