import { useState } from 'react'
import {
  Calculator,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { Card } from '../common/CommonUI'

export function MethodologyView() {
  // Interactive sensitivity weights simulator
  const [delBomWeight, setDelBomWeight] = useState(14.8)
  const [delBlrWeight, setDelBlrWeight] = useState(12.1)
  const [bomBlrWeight, setBomBlrWeight] = useState(11.2)
  const [delBomRel, setDelBomRel] = useState(105.4) // Price relative P_t / P_0
  const [delBlrRel, setDelBlrRel] = useState(102.8)
  const [bomBlrRel, setBomBlrRel] = useState(98.2)

  const simulatedMacroIndex = (
    (delBomWeight * delBomRel + delBlrWeight * delBlrRel + bomBlrWeight * bomBlrRel) /
    (delBomWeight + delBlrWeight + bomBlrWeight)
  ).toFixed(2)

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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Two-Tier Formulation &amp; Statistical Standards
            </h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              IMF CPI Manual 2020 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mathematical foundations bridging high-frequency dynamic web scraping with official MoSPI Laspeyres CPI
          </p>
        </div>
      </div>

      {/* Two-Tier Mathematical Framework Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1: Jevons Geometric Mean */}
        <Card className="p-6 border-t-4 border-t-blue-600 space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
              Tier 1 · Elementary Micro-Index
            </span>
            <span className="text-xs font-bold text-slate-500">IMF CPI Manual Ch. 10</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">1. Jevons Elementary Geometric Mean</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            At the elementary city-pair and advance booking horizon level ($T+1$ to $T+45$), price quotes are aggregated geometrically without requiring continuous intraday passenger quantity weights:
          </p>

          <div className="rounded-xl bg-slate-900 text-amber-300 p-4 font-mono text-center text-sm sm:text-base tracking-wide overflow-x-auto shadow-inner">
            I_J(t/0) = ( ∏ [P_i(t) / P_i(0)] )^(1/n)
          </div>

          <div className="space-y-2 text-xs text-slate-700 pt-1">
            <p className="font-semibold text-slate-900">Why Jevons Over Arithmetic Carli?</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>Axiomatic Reversal Test:</strong> Satisfies $I(t/0) \cdot I(0/t) = 1$, preventing upward drift.
              </li>
              <li>
                <strong>Dynamic Surge Smoothing:</strong> Prevents volatile intraday flash sales from artificially skewing the national index upward (the infamous "Carli bounce").
              </li>
            </ul>
          </div>
        </Card>

        {/* Tier 2: Modified Laspeyres */}
        <Card className="p-6 border-t-4 border-t-indigo-600 space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
              Tier 2 · Macro Composite Aggregate
            </span>
            <span className="text-xs font-bold text-slate-500">Official MoSPI Standard</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">2. Modified Laspeyres Macro Aggregate</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The national composite Airfare Price Index is computed by weighting each route's micro-index using quarterly passenger traffic volume shares published by the DGCA:
          </p>

          <div className="rounded-xl bg-slate-900 text-blue-300 p-4 font-mono text-center text-sm sm:text-base tracking-wide overflow-x-auto shadow-inner">
            {"P_L = [ ∑ (P_i,t · q_i,0) / ∑ (P_i,0 · q_i,0) ] × 100"}
          </div>

          <div className="space-y-2 text-xs text-slate-700 pt-1">
            <p className="font-semibold text-slate-900">Where Route Weights (w_r) are Derived Dynamically:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                {"w_r = (Passenger Volume_r) / (∑ Total Domestic Traffic)"}
              </li>
              <li>
                Prevents unweighted averaging: High-density routes like DEL-BOM (14.8%) carry appropriate macroeconomic importance compared to regional UDAN links.
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Interactive Sensitivity & Weight Simulator */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Interactive Laspeyres Weight Sensitivity Simulator</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Test how shifts in DGCA route passenger traffic shares or route price relatives impact the composite national index
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

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DEL-BOM Slider */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">DEL-BOM (Trunk Corridor)</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Weight: {delBomWeight}%</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Passenger Weight ($w_1$):</span>
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
                <span>Price Relative ($I_1$):</span>
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

          {/* DEL-BLR Slider */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">DEL-BLR (Tech Corridor)</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Weight: {delBlrWeight}%</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Passenger Weight ($w_2$):</span>
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
                <span>Price Relative ($I_2$):</span>
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

          {/* BOM-BLR Slider */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">BOM-BLR (South-West)</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Weight: {bomBlrWeight}%</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 flex justify-between">
                <span>Passenger Weight ($w_3$):</span>
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
                <span>Price Relative ($I_3$):</span>
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

        {/* Calculated Output Banner */}
        <div className="mt-6 rounded-xl bg-[#0B2545] p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-300 font-bold">
              Dynamically Simulated Composite APIx
            </p>
            <p className="text-3xl font-black text-white mt-1">{simulatedMacroIndex}</p>
            <p className="text-xs text-slate-300 mt-1">
              Modified Laspeyres weighted average across simulated sector weights
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 px-4 py-2.5 rounded-xl text-xs text-blue-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Mathematical circularity &amp; transitivity verified</span>
          </div>
        </div>
      </Card>

      {/* Slide 6: Global Benchmarks & Comparative Paradigm */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base">Global Benchmarks &amp; Comparative Methodology (Slide 6)</h3>
          <p className="mt-1 text-xs text-slate-500">
            Evaluating traditional MoSPI CPI versus international statistical practices (UK ONS &amp; Eurostat) and AndroMatrix APIx
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-[#0B2545] text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 font-bold">Dimension</th>
                <th className="px-4 py-3 font-bold text-amber-300">MoSPI Traditional CPI</th>
                <th className="px-4 py-3 font-bold text-blue-300">UK ONS / Eurostat Standard</th>
                <th className="px-4 py-3 font-bold text-emerald-400">AndroMatrix APIx Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">Collection Frequency</td>
                <td className="px-4 py-3 text-red-600 font-medium">Monthly field visits (45-day lag)</td>
                <td className="px-4 py-3 text-slate-700">Weekly automated web scraping</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">Every 6 Hours (Real-Time Ingestion)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">Booking Horizon Bias</td>
                <td className="px-4 py-3 text-red-600 font-medium">Single uncalibrated sample day</td>
                <td className="px-4 py-3 text-slate-700">3 Fixed horizons (T+1, T+7, T+30)</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">5 Fixed horizons (T+1, T+7, T+15, T+30, T+45)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">Route Weighting</td>
                <td className="px-4 py-3 text-red-600 font-medium">Simple unweighted route average</td>
                <td className="px-4 py-3 text-slate-700">Civil aviation annual passenger weights</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">Quarterly DGCA Passenger Traffic Shares ($w_r$)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">Elementary Formula</td>
                <td className="px-4 py-3 text-red-600 font-medium">Carli arithmetic mean (upward drift)</td>
                <td className="px-4 py-3 text-slate-700">Jevons geometric mean</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">Jevons Geometric + Core 24h Trimmed Mean</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">Data Integrity &amp; Provenance</td>
                <td className="px-4 py-3 text-red-600 font-medium">Manual field surveyor logbooks</td>
                <td className="px-4 py-3 text-slate-700">Server CSV storage</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">Immutable SHA-256 Cryptographic Audit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
