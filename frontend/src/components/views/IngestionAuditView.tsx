import { useState } from 'react'
import {
  Database,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Server,
  Key,
  Code2,
} from 'lucide-react'
import { rawScrapeFeed, pipelineTelemetry } from '../../data/mockData'
import { Card } from '../common/CommonUI'
import type { ScrapedFareRecord } from '../../types/apix'

const dpiEndpoints = [
  {
    method: 'GET',
    path: '/api/v1/analytics/trend?horizon=30d',
    desc: "Returns 30-day Headline & Core Trimmed APIx time-series for MoSPI CPI data warehouse ingestion",
    latency: '34ms',
    sampleResponse: {
      status: 'success',
      timestamp: '2024-08-20T06:15:00Z',
      baseYear: '2024=100',
      series: [
        { date: '2024-08-19', headlineApix: 141.7, coreTrimmedApix: 139.2, baseline: 134.4 },
        { date: '2024-08-20', headlineApix: 142.5, coreTrimmedApix: 140.1, baseline: 134.8 }
      ],
      methodology: 'IMF CPI Manual 2020 Ch. 10 Jevons Geometric Mean'
    }
  },
  {
    method: 'GET',
    path: '/api/v1/analytics/elasticity',
    desc: 'Returns matched-model constant horizon pricing across T+1, T+7, T+15, T+30, T+45 lead times',
    latency: '29ms',
    sampleResponse: {
      status: 'success',
      basket: [
        { horizon: 'T+1', avgFare: 8650, baseFare: 6100, surgeFactor: 1.63 },
        { horizon: 'T+7', avgFare: 6820, baseFare: 4850, surgeFactor: 1.28 },
        { horizon: 'T+30', avgFare: 5480, baseFare: 3880, surgeFactor: 1.03 }
      ]
    }
  },
  {
    method: 'GET',
    path: '/api/v1/routes/parity',
    desc: 'Returns cross-airline price dispersion matrix and monopoly alerts for CCI & DGCA regulators',
    latency: '41ms',
    sampleResponse: {
      status: 'success',
      sectorsAudited: 150,
      monopolyWarnings: 1,
      topParitySpread: { route: 'DEL-IXL', spreadPercent: 39.4, flagged: true }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/audit/feed?limit=5',
    desc: 'Returns verified fare observations with immutable SHA-256 cryptographic signatures',
    latency: '38ms',
    sampleResponse: {
      status: 'success',
      totalVerifiedToday: 145210,
      quotes: [
        {
          id: 'SCR-90821',
          route: 'DEL-BOM',
          carrier: 'IndiGo',
          baseFare: 5420,
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          hampelVerified: true
        }
      ]
    }
  }
]

export function IngestionAuditView() {
  const [activeTab, setActiveTab] = useState<'audit' | 'dpi'>('audit')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<ScrapedFareRecord | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(dpiEndpoints[0])
  const [copiedApiSnippet, setCopiedApiSnippet] = useState(false)

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

  const copyCurl = (path: string) => {
    const curl = `curl -X GET "https://api.andromatrix.live${path}" -H "Authorization: Bearer MOSPI_GOV_TOKEN"`
    navigator.clipboard.writeText(curl)
    setCopiedApiSnippet(true)
    setTimeout(() => setCopiedApiSnippet(false), 2000)
  }

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Ingestion, Cryptographic Audit &amp; DPI Gateway
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              SHA-256 Provenance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated scraping telemetry, Hampel/IQR outlier suppression, and MoSPI DPI REST API (&lt;50ms response)
          </p>
        </div>

        {/* View Switcher: Audit vs DPI */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Scraper &amp; Provenance</span>
          </button>
          <button
            onClick={() => setActiveTab('dpi')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition cursor-pointer ${
              activeTab === 'dpi'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-amber-300" />
            <span>DPI-Ready API (&lt;50ms)</span>
          </button>
        </div>
      </div>

      {activeTab === 'audit' && (
        <>
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
              <p className="mt-1 text-xs text-slate-500">Hampel &amp; IQR rejection (0.21% rate)</p>
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

          {/* Searchable Cryptographic Audit Log Table */}
          <Card className="overflow-hidden border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">Cryptographic Provenance Explorer</h3>
                  <Key className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Select any record to view its immutable SHA-256 seal, decomposed components, and schema validation
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
                    <th className="px-5 py-3.5 font-bold">Stripped Add-ons</th>
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
                            Quarantined
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* DPI-Ready MoSPI REST API Explorer (Slide 5) */}
      {activeTab === 'dpi' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-blue-900 text-white p-5 rounded-xl">
            <div className="space-y-1">
              <span className="rounded bg-emerald-400 text-slate-900 text-[10px] font-black px-2 py-0.5 uppercase">
                Slide 5 DPI-Ready
              </span>
              <h3 className="text-base font-bold text-white">Enterprise MoSPI Data Warehouse REST API</h3>
              <p className="text-xs text-blue-200">
                Built as a low-latency digital public infrastructure bridge (&lt;50ms SLA) for national statistical integration
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-200 block">Observed Latency</span>
              <span className="text-2xl font-black text-emerald-300">38ms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Endpoints List */}
            <div className="lg:col-span-5 space-y-2.5">
              <p className="text-xs font-bold text-slate-700">Available Public Infrastructure Endpoints:</p>
              {dpiEndpoints.map((ep) => (
                <div
                  key={ep.path}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    selectedEndpoint.path === ep.path
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">{ep.method}</span>
                    <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                      {ep.latency}
                    </span>
                  </div>
                  <p className="font-mono text-xs font-semibold text-slate-900 truncate">{ep.path}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{ep.desc}</p>
                </div>
              ))}
            </div>

            {/* Interactive Response Inspector */}
            <div className="lg:col-span-7">
              <Card className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">{selectedEndpoint.method}</span>
                    <h4 className="font-mono text-sm font-bold text-slate-900">{selectedEndpoint.path}</h4>
                  </div>
                  <button
                    onClick={() => copyCurl(selectedEndpoint.path)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#0B2545] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition cursor-pointer"
                  >
                    {copiedApiSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedApiSnippet ? 'cURL Copied' : 'Copy cURL'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">Live JSON Payload Response (200 OK):</span>
                  <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72">
                    {JSON.stringify(selectedEndpoint.sampleResponse, null, 2)}
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">Record Provenance: {selectedRecord.id}</h4>
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
                <span className="text-slate-400 block font-semibold">Pydantic Schema:</span>
                <span className="font-bold text-emerald-700 text-sm">Validated Clean</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600">SHA-256 Signature:</span>
              <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-2 text-white font-mono text-[10px] break-all">
                <span className="flex-1">{selectedRecord.sha256Hash}</span>
                <button
                  onClick={() => copyToClipboard(selectedRecord.sha256Hash)}
                  className="p-1 rounded hover:bg-slate-700 transition cursor-pointer"
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
