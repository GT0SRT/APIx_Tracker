import { useState } from 'react'
import {
  Database,
  Activity,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Server,
  Key,
} from 'lucide-react'
import { rawScrapeFeed, pipelineTelemetry } from '../../data/mockData'
import { Card } from '../common/CommonUI'
import type { ScrapedFareRecord } from '../../types/apix'

export function IngestionAuditView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<ScrapedFareRecord | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)

  const filteredLogs = rawScrapeFeed.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      item.id.toLowerCase().includes(q) ||
      item.carrier.toLowerCase().includes(q) ||
      `${item.origin}-${item.destination}`.toLowerCase().includes(q) ||
      item.sha256Hash.toLowerCase().includes(q)
    )
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Ingestion Pipeline &amp; Cryptographic Audit
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              SHA-256 Provenance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auditing Playwright automated ingestion, Hampel/IQR outlier rejection, and immutable cryptographic hashes
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>Pipeline Status: 99.82% SLA Active</span>
        </div>
      </div>

      {/* Production Telemetry Grid (Slide 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Anti-Bot Shield</span>
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-lg font-black text-slate-900">{pipelineTelemetry.tlsFingerprintSpoof}</p>
          <p className="mt-1 text-xs text-slate-500">JA3/JA4 TLS spoofing + {pipelineTelemetry.residentialProxyPool}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>DOM Shift Resiliency</span>
            <Server className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-lg font-black text-slate-900">JSON Interception</p>
          <p className="mt-1 text-xs text-slate-500">{pipelineTelemetry.domSchemaStatus}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Outlier Engine</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-lg font-black text-slate-900">{pipelineTelemetry.outliersFilteredToday} Quarantined</p>
          <p className="mt-1 text-xs text-slate-500">Hampel &amp; IQR rejection (0.21% failure rate)</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Database Storage</span>
            <Database className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-lg font-black text-slate-900">{pipelineTelemetry.averageLatencyMs}ms Latency</p>
          <p className="mt-1 text-xs text-slate-500">TimescaleDB Hypertable on Neon PostgreSQL</p>
        </Card>
      </div>

      {/* Outlier Filter & Fallback Engine Methodology Card (Slide 3) */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-[#0B2545] text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 border border-blue-400/30">
                Slide 3 Architecture
              </span>
              <h3 className="text-base font-bold text-white">Outlier Filter &amp; Fallback Engine (Hampel &amp; IQR)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To guarantee that dynamic pricing glitches or sudden aircraft downgrades do not pollute the official CPI index, incoming fares undergo a dual-stage rejection filter: <strong>Hampel 3-sigma filter</strong> for rolling temporal spikes and <strong>Interquartile Range (IQR = Q3 + 1.5 * IQR)</strong> for cross-sectional fleet outliers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Statistical Confidence</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">99.8%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Backtested 30 Days</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Daily Quotes Ingested</p>
              <p className="text-xl font-black text-blue-400 mt-0.5">145.2K</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Across 150 Routes</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Searchable Cryptographic Audit Log Table */}
      <Card className="overflow-hidden border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Cryptographic Provenance Explorer</h3>
              <Key className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Select any record to view its immutable SHA-256 seal, decomposed components, and Pydantic schema validation
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search record ID, sector, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-600 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-[#0B2545] text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5 font-bold">Quote ID</th>
                <th className="px-5 py-3.5 font-bold">Sector</th>
                <th className="px-5 py-3.5 font-bold">Carrier</th>
                <th className="px-5 py-3.5 font-bold">Horizon</th>
                <th className="px-5 py-3.5 font-bold">Base Fare</th>
                <th className="px-5 py-3.5 font-bold">Stripped Ancillaries</th>
                <th className="px-5 py-3.5 font-bold">SHA-256 Provenance Hash</th>
                <th className="px-5 py-3.5 font-bold">Hampel/IQR Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRecord(row)}
                  className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-bold text-blue-600">{row.id}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-bold text-slate-900">
                    {row.origin}-{row.destination}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-700">{row.carrier}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-bold text-slate-800">{row.horizon}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-extrabold text-slate-900">
                    ₹{row.baseFare.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-500 font-mono">
                    ₹{row.voluntaryAddonsStripped}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[10px] text-slate-600">
                    {row.sha256Hash.substring(0, 16)}...
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    {row.status === 'Cleaned' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        Outlier Quarantined
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Modal for Selected Record */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Record Provenance: {selectedRecord.id}
                </h4>
                <p className="text-xs text-slate-500">{selectedRecord.scrapedTimestamp}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Route Sector:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedRecord.origin} → {selectedRecord.destination}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Operating Carrier:</span>
                <span className="font-bold text-slate-800 text-sm">{selectedRecord.carrier}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Advance Horizon:</span>
                <span className="font-bold text-blue-700 text-sm">{selectedRecord.horizon}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold">Pydantic Schema Status:</span>
                <span className="font-bold text-emerald-700 text-sm">Valid Economy Y</span>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-1.5 text-xs bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Base Airfare (Transport Inflation Index):</span>
                <span>₹{selectedRecord.baseFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fuel Surcharge (ATF):</span>
                <span>₹{selectedRecord.fuelSurcharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Airport Development Fee (UDF):</span>
                <span>₹{selectedRecord.airportTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700 line-through">
                <span>Voluntary Add-ons (Meals/Seats Stripped):</span>
                <span>₹{selectedRecord.voluntaryAddonsStripped.toLocaleString()}</span>
              </div>
              <div className="border-t border-blue-200 pt-1 flex justify-between font-extrabold text-blue-800">
                <span>Total Validated Fare:</span>
                <span>₹{selectedRecord.totalFare.toLocaleString()}</span>
              </div>
            </div>

            {/* Cryptographic Hash Verification */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600">Immutable SHA-256 Provenance Signature:</span>
              <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-2 text-white font-mono text-[10px] break-all">
                <span className="flex-1">{selectedRecord.sha256Hash}</span>
                <button
                  onClick={() => copyToClipboard(selectedRecord.sha256Hash)}
                  className="p-1 rounded hover:bg-slate-700 transition cursor-pointer shrink-0"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-300" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2 bg-[#0B2545] hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Close Record Audit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
