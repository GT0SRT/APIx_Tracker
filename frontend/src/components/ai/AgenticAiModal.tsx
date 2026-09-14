import { useState } from 'react'
import {
  Bot,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  X,
  RefreshCw,
} from 'lucide-react'
import { agenticAnomalyAlerts, agentWorkflowSteps } from '../../data/agenticData'
import { Card } from '../common/CommonUI'
import type { AnomalyAlert } from '../../types/apix'

interface AgenticAiProps {
  isModal?: boolean
  onClose?: () => void
}

export function AgenticAiModal({ isModal = false, onClose }: AgenticAiProps) {
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(agenticAnomalyAlerts[0])
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('')

  const triggerScan = () => {
    setIsScanning(true)
    setScanMessage('Agent scanning 150 domestic sectors across IndiGo, Air India, Akasa Air...')
    setTimeout(() => {
      setIsScanning(false)
      setScanMessage('Scan complete: 3 anomalies active. All cryptographic seals verified.')
    }, 1400)
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Autonomous 24/7 Monitoring Agent
                </h2>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Agent Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Continuous anomaly detection, spike isolation, and autonomous root-cause investigations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Trigger Live Sector Scan'}</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {scanMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-medium">
          {scanMessage}
        </div>
      )}

      {/* Autonomous Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {agentWorkflowSteps.map((step) => (
          <div key={step.step} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-blue-600">STEP {step.step}</span>
              <span className="rounded bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2">
                {step.status}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-[11px] truncate">{step.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Main Alert Feed & Root-Cause Investigation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Anomaly Feed Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Detected Anomaly Alerts ({agenticAnomalyAlerts.length})</span>
            <span className="text-slate-400 font-normal">Real-Time Queue</span>
          </div>

          {agenticAnomalyAlerts.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`rounded-xl border p-4 transition cursor-pointer space-y-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {alert.severity === 'Critical' && (
                      <span className="rounded bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 border border-red-200">
                        Critical Spike
                      </span>
                    )}
                    {alert.severity === 'Warning' && (
                      <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                        Market Variance
                      </span>
                    )}
                    {alert.severity === 'Info' && (
                      <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                        Promo Surge
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">{alert.route}</span>
                </div>

                <p className="font-bold text-xs text-slate-900 leading-snug">{alert.title}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2">{alert.description}</p>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-medium">
                  <span>Carrier: {alert.carrier}</span>
                  <span className="font-bold text-blue-700">{alert.deviationPercent}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Root-Cause Investigation Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <Card className="p-6 space-y-5 border-2 border-blue-100">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{selectedAlert.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-500">Autonomous Diagnostic Report</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAlert.title}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Agent Confidence
                  </span>
                  <span className="text-lg font-black text-emerald-600">{selectedAlert.agentConfidence}%</span>
                </div>
              </div>

              {/* Quick Meta Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Sector &amp; Carrier:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAlert.route} ({selectedAlert.carrier})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Horizon Window:</span>
                  <span className="font-bold text-slate-800">{selectedAlert.horizon}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Price Deviation:</span>
                  <span className="font-extrabold text-red-600">{selectedAlert.deviationPercent}</span>
                </div>
              </div>

              {/* Automated Root Cause Analysis */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Autonomous Root-Cause Findings</span>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <p>{selectedAlert.rootCause}</p>
                </div>
              </div>

              {/* Autonomous Countermeasure / Action Taken */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Pipeline Countermeasure &amp; Quarantine Action</span>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <p>{selectedAlert.actionTaken}</p>
                </div>
              </div>

              {selectedAlert.regulatoryFlag && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>
                    Flagged for regulatory compliance review under CCI / DGCA airfare surveillance guidelines.
                  </span>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-400">
              Select an anomaly alert to inspect the autonomous investigation report.
            </div>
          )}
        </div>
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
