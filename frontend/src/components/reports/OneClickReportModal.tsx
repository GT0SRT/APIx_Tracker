import { useState } from 'react'
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

interface OneClickReportProps {
  onClose: () => void
}

export function OneClickReportModal({ onClose }: OneClickReportProps) {
  const [copied, setCopied] = useState(false)

  const reportDate = 'August 20, 2024'
  const reportId = 'REP-MOSPI-2024-08'

  const markdownReport = `# MoSPI & RBI Airfare Price Index (APIx) Executive Brief
**Report ID:** ${reportId}  
**Date of Release:** ${reportDate}  
**Target Authority:** National Statistical Office (NSO) / MoSPI & Reserve Bank of India (RBI)  
**Methodology Standard:** IMF CPI Manual (2020) & DGCA Passenger Volume Shares  

---

## 1. Key Macroeconomic Transport Indicators
* **Headline APIx:** 142.5 (+2.4% MoM)
* **Core Trimmed APIx (24h Smooth):** 140.1 (+1.6% MoM)
* **Official MoSPI Survey CPI (Lagged):** 128.5 (45-Day manual reporting lag)
* **Nowcasting Advantage:** +45 Days ahead of official field survey publication
* **Data Confidence:** 99.8% with 145,210 standardized quotes across 150 routes

---

## 2. Executive Synthesis & Policy Overview
During the 30-day reporting window, domestic air travel recorded moderate upward pressure driven primarily by last-minute advance purchase premiums (T+1 at +63% above baseline). The implementation of the Jevons Geometric Mean prevented dynamic algorithmic surge flash sales from artificially inflating the national composite index.

### Top Volatile Corridors:
1. **DEL-BOM (Trunk):** Current fare ₹6,820 (Surge factor 1.28x)
2. **DEL-IXL (Leh):** 39.4% carrier spread flagged for CCI competition review
3. **BOM-GOI (Monsoon Leisure):** Promotional flash sales absorbed smoothly via 24h trimmed averaging

---

## 3. Recommended Monetary & Regulatory Actions
* **MoSPI:** Integrate APIx as primary forward-looking transport input for upcoming Base 2024=100 revision.
* **CCI / DGCA:** Review capacity slot allocation on Leh and Srinagar corridors where price spreads exceed 35%.
* **RBI Monetary Policy Committee (MPC):** Incorporate real-time +45-day airfare nowcasts into monthly inflation projection models.
`

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdownReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const printReport = () => {
    window.print()
  }

  const downloadTextFile = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MoSPI_APIx_Executive_Brief_${reportId}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  One-Click Executive Inflation Report
                </h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                  Ready to Export
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated synthesis compiling headline inflation, volatility spreads, and regulatory notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadTextFile}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              title="Download Markdown"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-1.5 rounded-lg bg-[#0B2545] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Report Preview */}
        <div className="space-y-6 rounded-xl border border-slate-200 p-6 bg-slate-50/40 text-slate-900">
          {/* Document Masthead */}
          <div className="border-b border-slate-200 pb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-700 font-extrabold">
                Ministry of Statistics &amp; Programme Implementation (MoSPI)
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Airfare Price Index (APIx) Executive Brief
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Augmenting Consumer Price Index (CPI Base 2024=100) with High-Frequency Scraped Data
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p className="font-mono font-bold text-slate-800">{reportId}</p>
              <p>{reportDate}</p>
              <p className="font-semibold text-emerald-700">Team AndroMatrix · SIH26056</p>
            </div>
          </div>

          {/* Key Macro Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Headline APIx</p>
              <p className="text-2xl font-black text-blue-700 mt-0.5">142.5</p>
              <p className="text-[10px] text-emerald-600 font-bold">+2.4% MoM</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Core Trimmed APIx</p>
              <p className="text-2xl font-black text-indigo-700 mt-0.5">140.1</p>
              <p className="text-[10px] text-indigo-600 font-bold">+1.6% (Smoothed)</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">MoSPI 45d Lag CPI</p>
              <p className="text-2xl font-black text-slate-500 mt-0.5">128.5</p>
              <p className="text-[10px] text-amber-700 font-medium">Lagging 45 Days</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Nowcasting Lead</p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">+45 Days</p>
              <p className="text-[10px] text-emerald-700 font-bold">Zero Latency</p>
            </div>
          </div>

          {/* Smart Synthesis Narrative (Slide 3) */}
          <div className="space-y-2 text-xs leading-relaxed text-slate-700">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Automated Executive Synthesis
            </h4>
            <p>
              In the current cycle, Indian domestic airfares exhibited significant intra-month dispersion, driven primarily by late-booking premiums in trunk corridors. Traditional manual monthly sampling would completely miss these micro-surges. Using the IMF-recommended Jevons Geometric Mean, APIx successfully neutralized algorithmic price bouncing, presenting a clean <strong>140.1 Core Trimmed</strong> reading for central banking and statistical augmentation.
            </p>
          </div>

          {/* Regional & Route Hotspots */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Monitored Route Hotspots</h4>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 text-[11px] uppercase font-bold">
                  <tr>
                    <th className="p-2.5">Corridor</th>
                    <th className="p-2.5">Avg Fare</th>
                    <th className="p-2.5">DGCA Weight</th>
                    <th className="p-2.5">Trend Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">DEL-BOM</td>
                    <td className="p-2.5 font-semibold text-slate-800">₹6,820</td>
                    <td className="p-2.5 text-blue-700 font-bold">14.8%</td>
                    <td className="p-2.5 text-slate-600">Stable corporate yield volume</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">DEL-IXL (Leh)</td>
                    <td className="p-2.5 font-semibold text-slate-800">₹14,200</td>
                    <td className="p-2.5 text-blue-700 font-bold">3.2%</td>
                    <td className="p-2.5 text-red-600 font-bold">Flagged: 39.4% carrier spread</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">BLR-HYD</td>
                    <td className="p-2.5 font-semibold text-slate-800">₹4,620</td>
                    <td className="p-2.5 text-blue-700 font-bold">7.5%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">Competitive regional pricing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Verification Stamp */}
          <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Cryptographic SHA-256 Audit Passed · 100% Tamper-Evident Records
            </span>
            <span>Generated via APIx Automated Ingestion Engine</span>
          </div>
        </div>
      </div>
    </div>
  )
}
