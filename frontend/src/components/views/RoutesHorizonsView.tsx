import { useState, useEffect, useMemo } from 'react'
import {
  Map,
  Scale,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Search,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { elasticityData, dgcaRoutesData, airlineParityData } from '../../data/mockData'
import { Card, ChartTooltip } from '../common/CommonUI'
import { Pagination } from '../common/Pagination'
import { fetchRouteParity, fetchRoutes, paginateData } from '../../services/api'
import type { AirlineParityItem, RouteTrafficWeight } from '../../types/apix'

export function RoutesHorizonsView() {
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM')
  const [paritySearch, setParitySearch] = useState('')
  const [parityData, setParityData] = useState<AirlineParityItem[]>(airlineParityData)
  const [routesList, setRoutesList] = useState<RouteTrafficWeight[]>(dgcaRoutesData)
  const [isLiveBackend, setIsLiveBackend] = useState(false)
  const [parityPage, setParityPage] = useState(1)
  const [parityPageSize, setParityPageSize] = useState(4)

  useEffect(() => {
    let mounted = true
    void Promise.all([fetchRouteParity(), fetchRoutes()]).then(([parityRes, routesRes]) => {
      if (!mounted) return
      if (parityRes.data && parityRes.data.length > 0) setParityData(parityRes.data)
      if (routesRes.data && routesRes.data.length > 0) setRoutesList(routesRes.data)
      setIsLiveBackend(parityRes.isLive || routesRes.isLive)
    })
    return () => {
      mounted = false
    }
  }, [])

  const filteredParityData = useMemo(() => {
    return parityData.filter((item) =>
      item.route.toLowerCase().includes(paritySearch.toLowerCase())
    )
  }, [parityData, paritySearch])

  const paginatedParity = useMemo(() => {
    return paginateData(filteredParityData, parityPage, parityPageSize)
  }, [filteredParityData, parityPage, parityPageSize])

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Routes, Horizons &amp; Competition Parity
            </h2>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
              T+1 to T+45 Horizons
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                isLiveBackend
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isLiveBackend ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isLiveBackend ? 'Parity API: Live Connected' : 'Parity API: Standalone Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing advance booking elasticity curves, DGCA passenger weights, and cross-airline pricing spreads
          </p>
        </div>

        {/* Route Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Active Sector:</label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 shadow-xs cursor-pointer"
          >
            {dgcaRoutesData.map((r) => (
              <option key={r.route} value={r.route}>
                {r.route} (Weight: {r.dgcaWeight}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advance Purchase Curve Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-orange-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">T+1 Last-Minute Premium</p>
              <p className="mt-2 text-2xl font-black text-orange-600">+63%</p>
            </div>
            <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Average price ₹8,650 vs ₹5,320 at T+45 (Slide 2: 200%–400% surge gap)
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">DGCA Basket Coverage</p>
              <p className="mt-2 text-2xl font-black text-blue-700">150 Routes</p>
            </div>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Map className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Quarterly traffic-weighted city pairs covering 88.4% of total domestic passenger traffic
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Competitive Parity Spread</p>
              <p className="mt-2 text-2xl font-black text-emerald-700">10.8%</p>
            </div>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Scale className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Trunk route DEL-BOM carrier dispersion within fair competition threshold
          </p>
        </Card>
      </div>

      {/* Chart: The 5 Standard Advance-Purchase Booking Curves */}
      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Constant-Horizon Price Curve ($T+1$ to $T+45$)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Synthetic basket tracking strictly defined fixed lead times to prevent sampling bias (ILO &amp; Eurostat standard)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
              <span className="h-2 w-2 rounded-full bg-orange-600" />
              T+1 Surge Window
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              T+7 to T+45 Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={elasticityData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="window" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="baseFare" name="Base Fare" fill="#2563EB" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="taxes" name="Taxes & Fees" fill="#93C5FD" radius={[6, 6, 0, 0]} stackId="a">
                {elasticityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isHighSurge ? '#EA580C' : '#93C5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          {elasticityData.map((item) => (
            <div key={item.window} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
              <p className="font-bold text-slate-900">{item.window}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.days} Day{item.days > 1 ? 's' : ''} out</p>
              <p className="text-sm font-extrabold text-blue-700 mt-1">₹{item.fare.toLocaleString()}</p>
              <span
                className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.isHighSurge ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Slide 5: Market Competition Regulators (CCI / DGCA) Cross-Airline Parity */}
      <Card className="overflow-hidden border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Cross-Airline Pricing Parity Analytics (CCI &amp; DGCA Module)
              </h3>
              <span className="rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5">
                Regulator Mode
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Detects cross-airline price variances up to 35% and potential route monopolies (Slide 5)
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search route parity..."
              value={paritySearch}
              onChange={(e) => {
                setParitySearch(e.target.value)
                setParityPage(1)
              }}
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-600 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-[#0B2545] text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5 font-bold">Route Sector</th>
                <th className="px-5 py-3.5 font-bold">IndiGo</th>
                <th className="px-5 py-3.5 font-bold">Air India</th>
                <th className="px-5 py-3.5 font-bold">Akasa Air</th>
                <th className="px-5 py-3.5 font-bold">Price Spread</th>
                <th className="px-5 py-3.5 font-bold">Competition Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedParity.data.map((row) => (
                <tr key={row.route} className="hover:bg-blue-50/40 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3.5 font-bold text-slate-900">{row.route}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-800">
                    ₹{row.indigoFare.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-800">
                    ₹{row.airIndiaFare.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-800">
                    {row.akasaFare > 0 ? `₹${row.akasaFare.toLocaleString()}` : 'N/A (No Slot)'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-extrabold text-blue-700">
                    {row.priceSpreadPercent}%
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    {row.monopolyRisk === 'Competitive' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        Competitive
                      </span>
                    )}
                    {row.monopolyRisk === 'Moderate Variance' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                        Moderate Spread
                      </span>
                    )}
                    {row.monopolyRisk === 'Monopolistic Warning' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        Monopolistic Warning
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={paginatedParity.page}
          totalPages={paginatedParity.totalPages}
          totalItems={paginatedParity.total}
          pageSize={parityPageSize}
          pageSizeOptions={[3, 4, 6, 8]}
          onPageChange={setParityPage}
          onPageSizeChange={(size) => {
            setParityPageSize(size)
            setParityPage(1)
          }}
          itemName="corridors"
        />
      </Card>

      {/* DGCA Quarterly Route Weight Table */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">DGCA Passenger Traffic Volume Shares ($w_r$)</h3>
            <p className="mt-1 text-xs text-slate-500">
              City-pair passenger volume distribution determining weights in the Modified Laspeyres Index formulation
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Source: DGCA Q3 2024 Traffic Bulletin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {routesList.map((route) => (
            <div key={route.route} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">{route.route}</span>
                <span className="rounded bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5">
                  w = {route.dgcaWeight}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Monthly Pax:</span>
                <span className="font-semibold text-slate-800">{(route.passengersMonthly / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Top Carrier:</span>
                <span className="font-semibold text-slate-800">{route.topCarrier}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${route.dgcaWeight * 5}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
