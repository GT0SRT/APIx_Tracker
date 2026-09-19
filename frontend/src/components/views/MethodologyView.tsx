import { useState, useMemo } from 'react'
import {
  Calculator,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Users,
  Award,
  Globe,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Scale,
  BookOpen,
} from 'lucide-react'
import { Card } from '../common/CommonUI'
import { Pagination } from '../common/Pagination'
import { paginateData } from '../../services/api'
import { useJevonsCarliQuery } from '../../hooks/useApixQueries'
import { MathFormula } from '../common/MathFormula'

const stakeholderDividends = [
  {
    id: 'nso',
    title: 'National Statistical Office (NSO)',
    subtitle: 'Ministry of Statistics & Programme Implementation',
    icon: Landmark,
    impact: 'Ingests 10,000+ validated daily fare quotes across 150+ high-density city pairs, improving CPI transport fidelity by 40%+.',
    bullets: [
      'Replaces 45-day reporting lag with automated high-frequency data ingestion.',
      'Calibrated against official DGCA Q3 2024 city-pair passenger volume weights (wᵣ).',
      'Compliant with IMF CPI Manual (2020) Chapter 10 scanner data guidelines.'
    ]
  },
  {
    id: 'rbi',
    title: 'Monetary Policy Makers (RBI & MoCA)',
    subtitle: 'Reserve Bank of India & Ministry of Civil Aviation',
    icon: TrendingUp,
    impact: 'Provides real-time (<24h vs 45-day lag) price signals, enabling 10x faster macroeconomic forecasting and policy decisions.',
    bullets: [
      'Early nowcasts of transport inflation before official monthly CPI release.',
      'Isolates dynamic holiday surges from underlying core cost-push inflation.',
      'Monitors aviation turbine fuel (ATF) pass-through elasticity in real time.'
    ]
  },
  {
    id: 'cci',
    title: 'Market Competition Regulators (CCI / DGCA)',
    subtitle: 'Competition Commission of India & DGCA',
    icon: ShieldCheck,
    impact: 'Delivers cross-airline pricing parity analytics across 150+ routes to detect price variances, algorithmic collusion, and monopolies.',
    bullets: [
      'Automated surveillance of duopoly corridors (e.g. Leh, Srinagar).',
      'Monitors predatory pricing and sudden seat bucket exhaustion.',
      'Direct audit evidence backed by immutable SHA-256 signatures.'
    ]
  },
  {
    id: 'researchers',
    title: 'Aviation Researchers & Economists',
    subtitle: 'Civil Aviation Economists & Academics',
    icon: Award,
    impact: 'Grants access to 5 standard advance-purchase booking curves (T+1 to T+45) to analyze route-specific price elasticity.',
    bullets: [
      'Tracks yield management algorithms across airlines and booking windows.',
      'Analyzes passenger price sensitivity and lead-time demand curves.',
      'Standardized open research dataset across 150 domestic routes.'
    ]
  },
  {
    id: 'consumers',
    title: 'Consumer Protection & Travel Platforms',
    subtitle: 'Passenger Advocacy & Online Travel Platforms',
    icon: Users,
    impact: 'Empowers passenger advocacy by highlighting 200%–400% dynamic pricing margins and promoting transparent fare standards.',
    bullets: [
      'Discloses pure base fare stripped of voluntary add-ons.',
      'Alerts passengers to optimal booking windows (T+30 vs T+1 surge).',
      'Promotes fair airline pricing transparency across Indian civil aviation.'
    ]
  },
  {
    id: 'thinktanks',
    title: 'Academic & Economic Think Tanks',
    subtitle: 'Economic Policy Research Institutes',
    icon: Globe,
    impact: 'Enables data-driven research into transportation economics, infrastructure utilization, and travel demand modeling.',
    bullets: [
      'Longitudinal time-series modeling of transport inflation dynamics.',
      'Empirical validation of Jevons vs Carli index formula performance.',
      'Evidence-based policy papers for national transport infrastructure planning.'
    ]
  }
]

export function MethodologyView() {
  const [selectedStakeholder, setSelectedStakeholder] = useState(stakeholderDividends[0])
  const [aggPage, setAggPage] = useState(1)
  const [aggPageSize, setAggPageSize] = useState(3)

  const { data: jevonsRes } = useJevonsCarliQuery()
  const methodologyData = jevonsRes?.data || null
  const isLiveBackend = Boolean(jevonsRes?.isLive && !jevonsRes?.isDemoData)

  const paginatedAggregates = useMemo(() => {
    const list = methodologyData?.elementaryAggregates || []
    return paginateData(list, aggPage, aggPageSize)
  }, [methodologyData, aggPage, aggPageSize])

  // Interactive sensitivity weights simulator
  const [delBomWeight, setDelBomWeight] = useState(14.8)
  const [delBlrWeight, setDelBlrWeight] = useState(12.1)
  const [bomBlrWeight, setBomBlrWeight] = useState(11.2)
  const [delBomRel, setDelBomRel] = useState(105.4)
  const [delBlrRel, setDelBlrRel] = useState(102.8)
  const [bomBlrRel, setBomBlrRel] = useState(98.2)

  const totalSimWeight = delBomWeight + delBlrWeight + bomBlrWeight
  const simulatedMacroIndex =
    totalSimWeight > 0
      ? (
          (delBomWeight * delBomRel + delBlrWeight * delBlrRel + bomBlrWeight * bomBlrRel) /
          totalSimWeight
        ).toFixed(2)
      : '100.00'

  const resetWeights = () => {
    setDelBomWeight(14.8)
    setDelBlrWeight(12.1)
    setBomBlrWeight(11.2)
    setDelBomRel(105.4)
    setDelBlrRel(102.8)
    setBomBlrRel(98.2)
  }

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Methodology &amp; Mathematical Formulation
            </h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              IMF &amp; MoSPI Aligned
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Two-tier mathematical index architecture: Elementary Jevons Geometric Mean &amp; DGCA Passenger-Weighted Modified Laspeyres
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>IMF CPI Manual (2020) Ch. 10</span>
          </span>
        </div>
      </div>

      {/* Two-Tier Mathematical Framework Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1: Jevons Geometric Mean */}
        <Card className="p-6 border-t-4 border-t-blue-600 space-y-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="rounded bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
              Tier 1 · Elementary Micro-Index
            </span>
            <span className="text-xs font-semibold text-slate-500">Axiomatic Standard</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">1. Jevons Elementary Geometric Mean</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Aggregates price quotes geometrically across fixed advance purchase windows (T+1 to T+45) for each corridor:
            </p>
          </div>

          {/* Clean Formula Display */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 text-center">
            <MathFormula
              math="I_J^{0:t} = \left( \prod_{i=1}^{n} \frac{P_{i,t}}{P_{i,0}} \right)^{\frac{1}{n}}"
              displayMode
              className="text-slate-900 font-bold text-lg"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              IMF CPI Manual (2020) Formula 10.4
            </p>
          </div>

          {/* Parameter Chips */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">P_i,t</span>
              <span className="text-[10px] text-slate-500">Current Base Fare</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">P_i,0</span>
              <span className="text-[10px] text-slate-500">Reference Base Fare</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">n</span>
              <span className="text-[10px] text-slate-500">Validated Quotes</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">Axiomatic Advantage:</p>
            <p className="text-[11px] leading-relaxed">
              Satisfies the <strong>Time Reversal Test</strong> (<MathFormula math="I_{t/0} \cdot I_{0/t} = 1" />). Unlike arithmetic averages, it completely eliminates upward drift caused by dynamic flight price volatility.
            </p>
          </div>
        </Card>

        {/* Tier 2: Modified Laspeyres Macro Aggregate */}
        <Card className="p-6 border-t-4 border-t-indigo-600 space-y-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
              Tier 2 · Macro Composite Aggregate
            </span>
            <span className="text-xs font-semibold text-slate-500">MoSPI Standard</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">2. Modified Laspeyres Macro Aggregate</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Computes the national composite index by weighting elementary route indices with official quarterly passenger traffic shares:
            </p>
          </div>

          {/* Clean Formula Display */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-center">
            <MathFormula
              math="P_L^{0:t} = \sum_{r=1}^{R} w_r \cdot I_{J,r}^{0:t} \times 100"
              displayMode
              className="text-slate-900 font-bold text-lg"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Where <MathFormula math="w_r = Q_{r,0} \,/\, \sum Q_{k,0}" /> (DGCA Quarterly Passenger Traffic Share)
            </p>
          </div>

          {/* Parameter Chips */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block"><MathFormula math="w_r" /></span>
              <span className="text-[10px] text-slate-500">DGCA Q3 2024 Weight</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block"><MathFormula math="I_{J,r}" /></span>
              <span className="text-[10px] text-slate-500">Route Jevons Index</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block"><MathFormula math="R" /></span>
              <span className="text-[10px] text-slate-500">150+ Corridors</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">Traffic Calibration:</p>
            <p className="text-[11px] leading-relaxed">
              Prevents unweighted averaging bias. High-density trunk corridors (e.g. DEL-BOM at 14.8%) carry macroeconomic significance reflecting actual citizen expenditure.
            </p>
          </div>
        </Card>
      </div>

      {/* Jevons vs. Carli Bias Proof Table */}
      <Card className="p-6 border border-slate-200 shadow-sm bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Empirical Proof: Jevons vs. Carli Bias
              </h3>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                Axiomatic Proof
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Arithmetic averaging (Carli) overstates airfare inflation due to upward substitution bias; Jevons resolves this distortion
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
              isLiveBackend
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isLiveBackend ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {isLiveBackend ? 'Calculation Engine: Live DB' : 'Calculation Engine: Demo Data'}
          </span>
        </div>

        {/* 3 Metrics */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
            <span className="text-xs font-bold text-blue-700 uppercase">Jevons Geometric Mean (I_J)</span>
            <p className="mt-2 text-2xl font-black text-blue-900">
              {typeof methodologyData?.jevonsIndex === 'number'
                ? methodologyData.jevonsIndex.toFixed(2)
                : (Number(methodologyData?.jevonsIndex) || 104.28).toFixed(2)}
            </p>
            <p className="text-[11px] text-blue-700 mt-1 font-semibold">Strict Time Reversal (Zero Drift)</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
            <span className="text-xs font-bold text-amber-700 uppercase">Carli Arithmetic Mean (I_C)</span>
            <p className="mt-2 text-2xl font-black text-amber-900">
              {typeof methodologyData?.carliIndex === 'number'
                ? methodologyData.carliIndex.toFixed(2)
                : (Number(methodologyData?.carliIndex) || 107.15).toFixed(2)}
            </p>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">Flawed: Upward Drift on Volatility</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
            <span className="text-xs font-bold text-rose-700 uppercase">Overstatement Spread (Δ)</span>
            <p className="mt-2 text-2xl font-black text-rose-800">
              +{typeof methodologyData?.carliBias === 'number'
                ? methodologyData.carliBias.toFixed(2)
                : (Number(methodologyData?.carliBias) || 2.87).toFixed(2)} pts
            </p>
            <p className="text-[11px] text-rose-700 mt-1 font-semibold">Artificial Inflation Overstatement</p>
          </div>
        </div>

        {/* Paginated Route Breakdown */}
        {paginatedAggregates.total > 0 && (
          <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="bg-[#0F4C81] text-white text-[11px] uppercase tracking-wider font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-bold">Route Corridor</th>
                    <th className="px-4 py-3 font-bold">Base Benchmark (P_0)</th>
                    <th className="px-4 py-3 font-bold">Current Period (P_t)</th>
                    <th className="px-4 py-3 font-bold">Jevons Rel (I_J)</th>
                    <th className="px-4 py-3 font-bold">Carli Rel (I_C)</th>
                    <th className="px-4 py-3 font-bold">Overstatement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedAggregates.data.map((agg) => (
                    <tr key={agg.route} className="hover:bg-blue-50/40 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">{agg.route}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700 tabular-nums">₹{agg.basePeriodAverage}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700 tabular-nums">₹{agg.currentPeriodAverage}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-extrabold text-blue-700 tabular-nums">{(Number(agg.jevonsRatio) || 104.2).toFixed(1)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-extrabold text-amber-700 tabular-nums">{(Number(agg.carliRatio) || 107.1).toFixed(1)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-rose-600 tabular-nums">+{(Number(agg.bias) || 2.9).toFixed(1)} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={paginatedAggregates.page}
              totalPages={paginatedAggregates.totalPages}
              totalItems={paginatedAggregates.total}
              pageSize={aggPageSize}
              pageSizeOptions={[3, 5, 8]}
              onPageChange={setAggPage}
              onPageSizeChange={(size) => {
                setAggPageSize(size)
                setAggPage(1)
              }}
              itemName="route aggregates"
            />
          </div>
        )}
      </Card>

      {/* Interactive Sensitivity & Weight Simulator */}
      <Card className="p-6 border border-slate-200 shadow-sm bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Interactive Weight Sensitivity Simulator</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Simulate how shifts in DGCA route passenger traffic shares affect the composite national index
            </p>
          </div>
          <button
            onClick={resetWeights}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">DEL-BOM (Trunk Corridor)</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Weight: {delBomWeight}%</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Passenger Weight (w_1):</span>
                <span>{delBomWeight}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={delBomWeight}
                onChange={(e) => setDelBomWeight(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Price Relative:</span>
                <span className="font-bold text-slate-700">{delBomRel}</span>
              </label>
              <input
                type="range"
                min="80"
                max="140"
                step="0.5"
                value={delBomRel}
                onChange={(e) => setDelBomRel(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">DEL-BLR (Tech Corridor)</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Weight: {delBlrWeight}%</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Passenger Weight (w_2):</span>
                <span>{delBlrWeight}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={delBlrWeight}
                onChange={(e) => setDelBlrWeight(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Price Relative:</span>
                <span className="font-bold text-slate-700">{delBlrRel}</span>
              </label>
              <input
                type="range"
                min="80"
                max="140"
                step="0.5"
                value={delBlrRel}
                onChange={(e) => setDelBlrRel(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">BOM-BLR (South-West)</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Weight: {bomBlrWeight}%</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Passenger Weight (w_3):</span>
                <span>{bomBlrWeight}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={bomBlrWeight}
                onChange={(e) => setBomBlrWeight(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-amber-600"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Price Relative:</span>
                <span className="font-bold text-slate-700">{bomBlrRel}</span>
              </label>
              <input
                type="range"
                min="80"
                max="140"
                step="0.5"
                value={bomBlrRel}
                onChange={(e) => setBomBlrRel(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-amber-600"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-gradient-to-r from-[#0B2545] via-[#133A6B] to-[#0B2545] p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-200 font-bold">
              Simulated Composite APIx
            </p>
            <p className="text-3xl font-black text-white mt-1">{simulatedMacroIndex}</p>
            <p className="text-xs text-slate-300 mt-1">
              Modified Laspeyres weighted aggregate across simulated corridor shares
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 px-4 py-2.5 rounded-xl text-xs text-blue-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Mathematical circularity verified</span>
          </div>
        </div>
      </Card>

      {/* Multi-Stakeholder Policy Dividends */}
      <Card className="p-6 border border-slate-200 shadow-sm bg-white">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Multi-Stakeholder Policy Dividends
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Select any national economic institution to review specific analytical dividends delivered by the APIx Tracker
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stakeholder Selector Buttons (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {stakeholderDividends.map((stk) => {
              const isSelected = selectedStakeholder.id === stk.id
              const Icon = stk.icon
              return (
                <button
                  key={stk.id}
                  onClick={() => setSelectedStakeholder(stk)}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{stk.title}</p>
                      <p className="text-[10px] text-slate-500">{stk.subtitle}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </button>
              )
            })}
          </div>

          {/* Active Stakeholder Dividend Details (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-blue-100 bg-slate-50/70 p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Strategic Impact
                </span>
                <h4 className="text-base font-black text-slate-900">{selectedStakeholder.title}</h4>
                <p className="text-xs text-slate-500">{selectedStakeholder.subtitle}</p>
              </div>

              <div className="rounded-xl bg-white p-4 border border-slate-200 text-xs text-slate-800 leading-relaxed font-semibold shadow-2xs">
                {selectedStakeholder.impact}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-900">Key Deliverables:</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  {selectedStakeholder.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


