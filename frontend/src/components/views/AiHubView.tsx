import { useState } from 'react'
import {
  BrainCircuit,
  Sparkles,
  Layers,
  TrendingUp,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'
import {
  horizonForecastData,
  modelEvaluationMetrics,
  featureImportance,
  forecastMicroTrends,
} from '../../data/forecastingData'
import { Card, ChartTooltip } from '../common/CommonUI'

export function AiHubView() {
  const [selectedHorizon, setSelectedHorizon] = useState<string>('All')

  const activeHorizonPoint =
    selectedHorizon === 'All'
      ? null
      : horizonForecastData.find((d) => d.horizon === selectedHorizon)

  return (
    <div className="min-h-full flex-1 space-y-6 bg-[#07111f] p-4 text-slate-100 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#26364c] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.18)]">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
              Price Forecasting &amp; Predictive Horizons
            </h2>
            <span className="rounded-full bg-cyan-400/10 text-cyan-300 text-xs font-bold px-2.5 py-0.5 border border-cyan-400/30">
              Predictive Horizons
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            45-day lead-time predictive forecasting across constant purchase horizons (T+1 to T+45) and real-time inflation nowcasting
          </p>
        </div>

        {/* Model Calibration Status */}
        <div className="flex items-center gap-2 text-xs bg-[#0d1b2d] border border-[#26364c] rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.18)] px-3.5 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="font-bold text-slate-100">Active Forecasting Horizon</p>
            <p className="text-[10px] text-slate-400">High Forecast Reliability (94.2% Benchmark Accuracy)</p>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 shadow-inner flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="rounded bg-cyan-400/15 text-cyan-200 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wide">
            Predictive Horizon Engine
          </span>
          <span className="text-slate-300 font-medium">
            Multi-horizon predictive forecasting calibrated against 1.2M historical domestic quotes across 150+ corridors.
          </span>
        </div>
        <span className="text-cyan-300 font-semibold flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Lead-Time Window: T+1 to T+45
        </span>
      </div>

      {/* Model Performance KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-4 border-l-4 border-l-cyan-400">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Forecast Accuracy</p>
          <p className="text-2xl font-black text-slate-100 mt-1">{modelEvaluationMetrics.overallAccuracy}</p>
          <p className="text-[11px] text-cyan-300 font-medium mt-1">Multi-Horizon Time-Series</p>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-4 border-l-4 border-l-emerald-400">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mean Absolute Error (MAE)</p>
          <p className="text-2xl font-black text-slate-100 mt-1">{modelEvaluationMetrics.meanAbsoluteError}</p>
          <p className="text-[11px] text-emerald-300 font-medium mt-1">RMSE: {modelEvaluationMetrics.rootMeanSquareError}</p>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-4 border-l-4 border-l-violet-400">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Margin of Error</p>
          <p className="text-2xl font-black text-slate-100 mt-1">{modelEvaluationMetrics.meanAbsolutePercentageError}</p>
          <p className="text-[11px] text-violet-300 font-medium mt-1">30-Day Historical Backtest</p>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-4 border-l-4 border-l-amber-400">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data Coverage</p>
          <p className="text-2xl font-black text-slate-100 mt-1">1.2M+ Quotes</p>
          <p className="text-[11px] text-amber-300 font-medium mt-1">150+ monitored flight corridors</p>
        </Card>
      </div>

      {/* Forecast Trajectory Chart */}
      <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Predictive Price Horizon with 95% Confidence Interval (T+1 to T+45)
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Forecasting micro-trends and dynamic fare spikes to anticipate inflation shifts 45 days in advance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            {/* Horizon Filter Chips */}
            <div className="flex items-center gap-1 bg-[#0b1727] p-1 rounded-lg border border-[#26364c]">
              {['All', 'T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                    selectedHorizon === h
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.18)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Predicted Base Fare
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                95% Confidence Band
              </span>
            </div>
          </div>
        </div>

        {/* Selected Horizon Callout if filtered */}
        {activeHorizonPoint && (
          <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 shadow-inner flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-400 text-slate-950 font-bold px-2 py-0.5 text-xs">
                {activeHorizonPoint.horizon} Horizon ({activeHorizonPoint.daysAhead} days prior)
              </span>
              <span className="text-slate-300 font-medium">
                Predicted Fare: <strong className="text-slate-100">₹{activeHorizonPoint.predictedFare.toLocaleString('en-IN')}</strong>
              </span>
              <span className="text-slate-400">
                95% CI: ₹{activeHorizonPoint.lowerBound.toLocaleString('en-IN')} – ₹{activeHorizonPoint.upperBound.toLocaleString('en-IN')}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              activeHorizonPoint.surgeRisk === 'High Surge'
                ? 'bg-red-400/10 text-red-300 border border-red-400/20'
                : activeHorizonPoint.surgeRisk === 'Elevated'
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
            }`}>
              Surge Risk: {activeHorizonPoint.surgeRisk}
            </span>
          </div>
        )}

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={horizonForecastData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid stroke="#26364c" vertical={false} />
                  <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[4800, 9500]}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    name="Upper Bound (95% CI)"
                    stroke="none"
                    fill="#22D3EE"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    name="Lower Bound (95% CI)"
                    stroke="none"
                    fill="#0e1a2a"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedFare"
                    name="Predicted Fare"
                    stroke="#22D3EE"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#22D3EE' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalAvg"
                    name="Historical Moving Mean"
                    stroke="#8B5CF6"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Feature Importance & Micro Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-100 text-sm">Key Price Determinants</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Factor Contribution</span>
              </div>
              <div className="space-y-3">
                {featureImportance.map((feat) => (
                  <div key={feat.feature} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{feat.feature}</span>
                      <span className="font-extrabold text-cyan-300">{feat.weight}%</span>
                    </div>
                    <div className="w-full bg-[#1b2b3f] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full" style={{ width: `${feat.weight}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl !bg-gradient-to-br !from-[#101d2e] !via-[#0e1a2a] !to-[#0a1524] !border-[#26364c] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-100 text-sm">Dynamic Price Trend Insights</h3>
                </div>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="space-y-3">
                {forecastMicroTrends.map((trend) => (
                  <div key={trend.horizon} className="rounded-xl border border-[#26364c] bg-[#0b1727] p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        {trend.horizon} Horizon
                      </span>
                      <span className="rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-2 py-0.5 font-bold text-[10px]">
                        {trend.signal} ({trend.delta})
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{trend.narrative}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

      {/* Macroeconomic & MoSPI Policy Impact Card */}
      <Card className="p-5 border border-cyan-400/20 bg-gradient-to-r from-cyan-400/5 via-[#0d1b2d] to-violet-500/5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.18)]">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-sm">
              Anticipatory Transport Inflation: Why 45-Day Horizons Matter to MoSPI &amp; RBI
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional Consumer Price Index methodology records passenger airfares only after travel has occurred or on manual survey cycles, introducing a 45-day reporting lag. Because airline yield management algorithms adjust fares up to 45 days in advance of departure, APIx predictive modeling surfaces genuine market-clearing price changes weeks before official publication. This provides the Reserve Bank of India’s Monetary Policy Committee (MPC) and the Ministry of Statistics with a reliable leading indicator for transport CPI nowcasting.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
