import { useState } from 'react'
import {
  BrainCircuit,
  Bot,
  BookOpen,
  Sparkles,
  RefreshCw,
  Send,
  FileCheck,
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
import { agenticAnomalyAlerts, agentWorkflowSteps } from '../../data/agenticData'
import { policyRagKnowledgeBase } from '../../data/policyRagData'
import { Card, ChartTooltip } from '../common/CommonUI'
import type { AnomalyAlert, RagQaItem } from '../../types/apix'

interface AiHubViewProps {
  initialSubTab?: 'ml' | 'agent' | 'rag'
}

export function AiHubView({ initialSubTab = 'ml' }: AiHubViewProps) {
  const [subTab, setSubTab] = useState<'ml' | 'agent' | 'rag'>(initialSubTab)

  // Agent state
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert>(agenticAnomalyAlerts[0])
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('')

  // RAG state
  const [activeRagItem, setActiveRagItem] = useState<RagQaItem>(policyRagKnowledgeBase[0])
  const [customQuestion, setCustomQuestion] = useState('')
  const [isRagSearching, setIsRagSearching] = useState(false)

  const triggerScan = () => {
    setIsScanning(true)
    setScanMessage('Scanning 150 domestic sectors across IndiGo, Air India, Akasa Air...')
    setTimeout(() => {
      setIsScanning(false)
      setScanMessage('Scan complete: 3 anomalies active. All cryptographic seals verified.')
    }, 1200)
  }

  const handleRagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customQuestion.trim()) return

    setIsRagSearching(true)
    setTimeout(() => {
      const lower = customQuestion.toLowerCase()
      const match =
        policyRagKnowledgeBase.find((item) => {
          const q = item.question.toLowerCase()
          const a = item.answer.toLowerCase()
          return lower.split(' ').some((word) => word.length > 3 && (q.includes(word) || a.includes(word)))
        }) || policyRagKnowledgeBase[0]

      setActiveRagItem(match)
      setIsRagSearching(false)
      setCustomQuestion('')
    }, 500)
  }

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* Header with Sub-tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              AI Intelligence &amp; Autonomous Suite
            </h2>
            <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 border border-amber-300">
              SIH 2026 Core Differentiator
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Integrated predictive modeling, 24/7 anomaly monitoring, and policy compliance RAG pipeline
          </p>
        </div>

        {/* Clean Segmented Control */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold shadow-xs">
          <button
            onClick={() => setSubTab('ml')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition cursor-pointer ${
              subTab === 'ml'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Horizon Trend ML</span>
            <span className={`text-[10px] px-1 rounded ${subTab === 'ml' ? 'bg-white/20' : 'bg-slate-100'}`}>
              92%+
            </span>
          </button>

          <button
            onClick={() => setSubTab('agent')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition cursor-pointer ${
              subTab === 'agent'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-emerald-400" />
            <span>24/7 Anomaly Agent</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          <button
            onClick={() => setSubTab('rag')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition cursor-pointer ${
              subTab === 'rag'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Policy RAG Q&amp;A</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: HORIZON TREND ML FORECASTING */}
      {subTab === 'ml' && (
        <div className="space-y-6">
          {/* Status banner for in-development ML backend */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-amber-200 text-amber-900 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Backend ML Model: Coming Soon (Q3/Q4)
              </span>
              <span className="text-slate-700 font-medium">
                Deep temporal transformer training pipeline in development · Displaying interactive calibrated validation benchmark
              </span>
            </div>
            <span className="text-slate-500 font-semibold">TFT Architecture · PyTorch</span>
          </div>

          {/* Accuracy KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-600">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model Accuracy</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{modelEvaluationMetrics.overallAccuracy}</p>
              <p className="text-[11px] text-blue-700 font-medium mt-1">Temporal Fusion Transformer (TFT)</p>
            </Card>

            <Card className="p-4 border-l-4 border-l-emerald-600">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mean Absolute Error (MAE)</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{modelEvaluationMetrics.meanAbsoluteError}</p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">RMSE: {modelEvaluationMetrics.rootMeanSquareError}</p>
            </Card>

            <Card className="p-4 border-l-4 border-l-purple-600">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mean Abs % Error (MAPE)</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{modelEvaluationMetrics.meanAbsolutePercentageError}</p>
              <p className="text-[11px] text-purple-700 font-medium mt-1">Supervised 30d backtest</p>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Training Corpus</p>
              <p className="text-2xl font-black text-slate-900 mt-1">1.2M+ Quotes</p>
              <p className="text-[11px] text-amber-700 font-medium mt-1">Historical time-series sample</p>
            </Card>
          </div>

          {/* Forecast Trajectory Chart */}
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Predictive Price Horizon with 95% Confidence Interval ($T+1$ to $T+45$)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Forecasting micro-trends and dynamic fare spikes to anticipate inflation shifts 45 days in advance
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Predicted Base Fare
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
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

          {/* Feature Importance & Micro Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Key Predictor Feature Weights</h3>
                <span className="text-[11px] font-semibold text-slate-400">SHAP Attributions</span>
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

            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Dynamic Micro-Trend Signal Briefs</h3>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="space-y-3">
                {forecastMicroTrends.map((trend) => (
                  <div key={trend.horizon} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1">
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
      )}

      {/* SUB-TAB 2: 24/7 AGENTIC ANOMALY MONITOR */}
      {subTab === 'agent' && (
        <div className="space-y-6">
          {/* Status banner for autonomous agent daemon */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-blue-200 text-blue-900 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Autonomous Daemon: Coming Soon (Q3/Q4)
              </span>
              <span className="text-slate-700 font-medium">
                Autonomous self-healing worker daemon in staging · Displaying active anomaly detection diagnostics & Hampel simulation
              </span>
            </div>
            <span className="text-slate-500 font-semibold">Supervisor Daemon · LangChain</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-xs font-bold">24/7 Autonomous Ingestion &amp; Anomaly Sentinel Online</p>
                <p className="text-[11px] text-slate-300">
                  Scraping top 150 domestic corridors every 6 hours across domestic airlines and OTAs
                </p>
              </div>
            </div>
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Inspecting...' : 'Run Sector Diagnostics'}</span>
            </button>
          </div>

          {scanMessage && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-medium">
              {scanMessage}
            </div>
          )}

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {agentWorkflowSteps.map((step) => (
              <div key={step.step} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-600">PHASE {step.step}</span>
                  <span className="rounded bg-blue-50 text-blue-800 text-[9px] font-bold px-1.5 py-0.2">
                    {step.status}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-[11px] truncate">{step.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Alerts & Investigation Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-bold text-slate-700">Active Detected Anomalies ({agenticAnomalyAlerts.length})</p>
              {agenticAnomalyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`rounded-xl border p-4 transition cursor-pointer space-y-2 ${
                    selectedAlert.id === alert.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{alert.route}</span>
                    <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                  </div>
                  <p className="font-bold text-xs text-slate-900">{alert.title}</p>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Carrier: {alert.carrier}</span>
                    <span className="font-bold text-blue-700">{alert.deviationPercent}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-7">
              <Card className="p-6 space-y-5 border-2 border-blue-100">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700">{selectedAlert.id}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAlert.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                    <span className="text-lg font-black text-emerald-600">{selectedAlert.agentConfidence}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">Autonomous Root-Cause Investigation:</p>
                  <p className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-slate-700 leading-relaxed">
                    {selectedAlert.rootCause}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900">Pipeline Quarantine Countermeasure:</p>
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-slate-700 leading-relaxed">
                    {selectedAlert.actionTaken}
                  </p>
                </div>

                {selectedAlert.regulatoryFlag && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 font-medium">
                    Flagged for regulatory oversight under CCI / DGCA surveillance guidelines.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: POLICY & COMPLIANCE RAG Q&A */}
      {subTab === 'rag' && (
        <div className="space-y-6">
          {/* Status banner for Vector DB RAG */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Vector DB Live Embeddings: Coming Soon (Q3/Q4)
              </span>
              <span className="text-slate-700 font-medium">
                ChromaDB/Pinecone semantic search cluster indexing in progress · Displaying verified statutory knowledge base preview
              </span>
            </div>
            <span className="text-slate-500 font-semibold">MoSPI · DGCA · IMF Corpus</span>
          </div>

          {/* Suggested Chips */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Framework Inquiry:
            </p>
            <div className="flex flex-wrap gap-2">
              {policyRagKnowledgeBase.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveRagItem(item)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                    activeRagItem.id === item.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.category}: {item.question.substring(0, 42)}...
                </button>
              ))}
            </div>
          </div>

          {/* Grounded Response Card */}
          <Card className="p-6 border-2 border-blue-100 space-y-5">
            <div>
              <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                {activeRagItem.category}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">{activeRagItem.question}</h3>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-800 leading-relaxed space-y-1.5">
              <p className="font-semibold text-slate-900">Grounded Policy Synthesis:</p>
              <p>{activeRagItem.answer}</p>
            </div>

            {/* Citations */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Verified Ground-Truth Sources ({activeRagItem.citations.length})
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeRagItem.citations.map((cite) => (
                  <div key={cite.id} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-0.5">
                        {cite.organization}
                      </span>
                      <span className="font-bold text-emerald-600 text-[11px]">
                        Relevance: {(cite.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">{cite.title}</p>
                    <p className="text-[11px] text-blue-700 font-mono">{cite.reference}</p>
                    <p className="text-[11px] text-slate-600 italic">"{cite.excerpt}"</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Natural Language Search Input */}
          <form onSubmit={handleRagSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask anything regarding MoSPI CPI Base 2024=100, DGCA quarterly weights, or IMF Chapter 10..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-24 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
            />
            <button
              type="submit"
              disabled={isRagSearching || !customQuestion.trim()}
              className="absolute right-2 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              <span>Ask RAG</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
