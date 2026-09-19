import {
  BrainCircuit,
  Sparkles,
  X,
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

interface MlForecastingProps {
  isModal?: boolean
  onClose?: () => void
}

export function MlForecastingModal({ isModal = false, onClose }: MlForecastingProps) {

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Price Horizon Trend Forecasting
                </h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-300">
                  92.4% Accuracy
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Predictive forecasting of airfare trajectories and price surge volatility (T+1 to T+45)
              </p>
            </div>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Model Benchmark Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Forecast Accuracy</p>
          <p className="text-2xl font-black text-blue-950">{modelEvaluationMetrics.overallAccuracy}</p>
          <p className="text-[11px] text-blue-700/80 font-medium">Multi-Horizon Time-Series</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Mean Absolute Error</p>
          <p className="text-2xl font-black text-emerald-950">{modelEvaluationMetrics.meanAbsoluteError}</p>
          <p className="text-[11px] text-emerald-700/80 font-medium">RMSE: {modelEvaluationMetrics.rootMeanSquareError}</p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Margin of Error (MAPE)</p>
          <p className="text-2xl font-black text-purple-950">{modelEvaluationMetrics.meanAbsolutePercentageError}</p>
          <p className="text-[11px] text-purple-700/80 font-medium">Historical Backtest</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Historical Coverage</p>
          <p className="text-2xl font-black text-amber-950">1.2M+</p>
          <p className="text-[11px] text-amber-700/80 font-medium">Historical observations</p>
        </div>
      </div>

      {/* Forecast Chart with 95% Confidence Bounds */}
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Predictive Price Horizon with 95% Confidence Interval
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Shaded band indicates 95% confidence interval ($CI_{0.95}$) across advance booking days
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Predicted Base Airfare
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              95% Confidence Band
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={horizonForecastData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[4800, 9500]}
                tick={{ fontSize: 11, fill: '#64748B' }}
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
                fill="#93C5FD"
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                name="Lower Bound (95% CI)"
                stroke="none"
                fill="#FFFFFF"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="predictedFare"
                name="Predicted Fare"
                stroke="#1D4ED8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1D4ED8' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="historicalAvg"
                name="Historical Moving Mean"
                stroke="#64748B"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Feature Importance & Micro-Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Key Price Determinants</h3>
            <span className="text-[11px] font-semibold text-slate-400">Factor Contribution</span>
          </div>
          <div className="space-y-3">
            {featureImportance.map((feat) => (
              <div key={feat.feature} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{feat.feature}</span>
                  <span className="font-extrabold text-blue-700">{feat.weight}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${feat.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Micro-Trend Signals */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Dynamic Price Trend Insights</h3>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="space-y-3">
            {forecastMicroTrends.map((trend) => (
              <div key={trend.horizon} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{trend.horizon} Horizon</span>
                  <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 font-bold text-[10px]">
                    {trend.signal} ({trend.delta})
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{trend.narrative}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="my-6 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
          {content}
        </div>
      </div>
    )
  }

  return <div className="p-4 md:p-8 flex-1">{content}</div>
}
