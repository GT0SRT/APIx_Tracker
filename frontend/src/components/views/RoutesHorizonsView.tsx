import { useState, useMemo } from 'react'
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
import { paginateData } from '../../services/api'
import { useElasticityQuery, useRoutesQuery, useRouteParityQuery } from '../../hooks/useApixQueries'
import type { RouteTrafficWeight, ElasticityPoint } from '../../types/apix'

export function RoutesHorizonsView() {
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM')
  const [paritySearch, setParitySearch] = useState('')
  const [parityPage, setParityPage] = useState(1)
  const [parityPageSize, setParityPageSize] = useState(4)

  // TanStack React Query v5 with route-specific caching
  const routesQuery = useRoutesQuery()
  const elasticityQuery = useElasticityQuery(selectedRoute)
  const parityQuery = useRouteParityQuery()

  const routesList: RouteTrafficWeight[] = routesQuery.data?.data || dgcaRoutesData
  const elasticity: ElasticityPoint[] = elasticityQuery.data?.data || elasticityData
  const parityData = parityQuery.data?.data || airlineParityData

  const t1 = elasticity.find((e) => e.window === 'T+1')
  const t45 = elasticity.find((e) => e.window === 'T+45')
  const surgeVal = t1 && t45 && t45.fare > 0 ? Math.round(((t1.fare - t45.fare) / t45.fare) * 100) : 63
  const dynamicSurgePercent = `${surgeVal >= 0 ? '+' : ''}${surgeVal}%`
  const dynamicSurgeDesc =
    t1 && t45
      ? `Average price ₹${t1.fare.toLocaleString('en-IN')} vs ₹${t45.fare.toLocaleString('en-IN')} at T+45`
      : 'Average price ₹8,650 vs ₹5,320 at T+45 (200%–400% surge gap)'

  const topParitySpread = useMemo(() => {
    if (!parityData || parityData.length === 0) return '10.8%'
    const target = parityData.find((p) => p.route.includes(selectedRoute)) || parityData[0]
    return `${target.priceSpreadPercent}%`
  }, [parityData, selectedRoute])

  const filteredParityData = useMemo(() => {
    return parityData.filter((item) =>
      item.route.toLowerCase().includes(paritySearch.toLowerCase())
    )
  }, [parityData, paritySearch])

  const paginatedParity = useMemo(() => {
    return paginateData(filteredParityData, parityPage, parityPageSize)
  }, [filteredParityData, parityPage, parityPageSize])

  return (
    <div className="relative min-h-full flex-1 space-y-6 overflow-hidden bg-[#08111f] p-4 text-slate-100 md:p-8">
      <div className="pointer-events-none absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Routes, Horizons &amp; Competition Parity
            </h2>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
              T+1 to T+45 Horizons
            </span>
            {routesQuery.data?.isLive && !routesQuery.data?.isDemoData ? (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                Live Data
              </span>
            ) : (
              <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                Demo Data
              </span>
            )}
          </div>
          <p className="mt-1 max-w-3xl text-xs text-slate-400">
            Analyzing advance booking elasticity curves, DGCA passenger weights, and cross-airline pricing spreads
          </p>
        </div>

        {/* Route Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400">Active Sector:</label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="cursor-pointer rounded-xl border border-[#26364c] bg-[#101b2b] px-3 py-2 text-xs font-bold text-slate-200 shadow-[0_8px_25px_rgba(0,0,0,0.18)] outline-none transition focus:border-cyan-400"
          >
            {routesList.map((r) => {
              const rawWeight = Number(r.dgcaWeight)
              const weight = isNaN(rawWeight) || rawWeight <= 0 ? 5.0 : rawWeight
              const weightDisplay = weight < 1 && weight > 0 ? (weight * 100).toFixed(1) : weight.toFixed(1)
              return (
                <option key={r.route} value={r.route}>
                  {r.route} (Weight: {weightDisplay}%)
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Advance Purchase Curve Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="group relative overflow-hidden rounded-2xl !border-[#26364c] !bg-[#101b2b] p-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">T+1 Last-Minute Premium</p>
              <p className="mt-2 text-2xl font-black text-orange-300">{dynamicSurgePercent}</p>
            </div>
            <span className="rounded-lg border border-orange-400/20 bg-orange-400/10 p-2 text-orange-300">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {dynamicSurgeDesc}
          </p>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl !border-[#26364c] !bg-[#101b2b] p-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">DGCA Basket Coverage</p>
              <p className="mt-2 text-2xl font-black text-cyan-300">
                {routesList.length > 0 ? `${routesList.length} Corridors` : '150 Corridors'}
              </p>
            </div>
            <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
              <Map className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Quarterly traffic-weighted city pairs covering 88.4% of total domestic passenger traffic
          </p>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl !border-[#26364c] !bg-[#101b2b] p-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Competitive Parity Spread</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{topParitySpread}</p>
            </div>
            <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300">
              <Scale className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Trunk route {selectedRoute} carrier dispersion within fair competition threshold
          </p>
        </Card>
      </div>

      {/* Chart: The 5 Standard Advance-Purchase Booking Curves */}
      <Card className="group relative overflow-hidden rounded-2xl !border-[#26364c] !bg-[#101b2b] p-6 text-white shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base">
                Constant-Horizon Price Curve (T+1 to T+45)
              </h3>
              {elasticityQuery.data?.isLive && !elasticityQuery.data?.isDemoData ? (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Live Data
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Demo Data
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Synthetic basket tracking strictly defined fixed lead times to prevent sampling bias (ILO &amp; Eurostat standard)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-orange-300 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              T+1 Surge Window
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              T+7 to T+45 Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={elasticity} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#26364c" vertical={false} />
              <XAxis dataKey="window" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="baseFare" name="Base Fare" fill="#2563EB" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="taxes" name="Taxes & Fees" fill="#93C5FD" radius={[6, 6, 0, 0]} stackId="a">
                {elasticity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isHighSurge ? '#EA580C' : '#93C5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          {elasticity.map((item) => (
            <div key={item.window} className="rounded-xl border border-[#26364c] bg-[#0c1727] p-2.5 transition-all duration-200 hover:border-cyan-400/30 hover:bg-[#122035]">
              <p className="font-bold text-white">{item.window}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{item.days} Day{item.days > 1 ? 's' : ''} out</p>
              <p className="mt-1 text-sm font-extrabold text-cyan-300">₹{item.fare.toLocaleString()}</p>
              <span
                className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.isHighSurge ? 'bg-orange-400/10 text-orange-300 border border-orange-400/20' : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                }`}
              >
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Slide 5: Market Competition Regulators (CCI / DGCA) Cross-Airline Parity */}
      <Card className="overflow-hidden rounded-2xl !border-[#26364c] !bg-[#101b2b] text-white shadow-[0_14px_35px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#26364c] bg-[#0c1727] p-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base">
                Cross-Airline Pricing Parity Analytics (CCI &amp; DGCA Module)
              </h3>
              <span className="rounded bg-violet-400/10 text-violet-300 border border-violet-400/20 text-[10px] font-bold px-2 py-0.5">
                Regulator Mode
              </span>
              {parityQuery.data?.isLive && !parityQuery.data?.isDemoData ? (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                  Live Data
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                  Demo Data
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Detects cross-airline price variances up to 35% and potential route monopolies across scheduled carriers
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
              className="rounded-lg w-48 rounded-xl border border-[#26364c] bg-[#0c1727] py-2 pl-8 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
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
            <tbody className="divide-y divide-[#26364c] bg-[#101b2b]">
              {paginatedParity.data.map((row) => (
                <tr key={row.route} className="transition-colors hover:bg-cyan-400/5">
                  <td className="whitespace-nowrap px-5 py-3.5 font-bold text-white">{row.route}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-200">
                    ₹{row.indigoFare.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-200">
                    ₹{row.airIndiaFare.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-200">
                    {row.akasaFare > 0 ? `₹${row.akasaFare.toLocaleString()}` : 'N/A (No Slot)'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-extrabold text-cyan-300">
                    {row.priceSpreadPercent}%
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    {row.monopolyRisk === 'Competitive' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        Competitive
                      </span>
                    )}
                    {row.monopolyRisk === 'Moderate Variance' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                        Moderate Spread
                      </span>
                    )}
                    {row.monopolyRisk === 'Monopolistic Warning' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[11px] font-bold text-red-300">
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
      <Card className="group relative overflow-hidden rounded-2xl !border-[#26364c] !bg-[#101b2b] p-6 text-white shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">DGCA Passenger Traffic Volume Shares ($w_r$)</h3>
            <p className="mt-1 text-xs text-slate-500">
              City-pair passenger volume distribution determining weights in the Modified Laspeyres Index formulation
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Source: DGCA Q3 2024 Traffic Bulletin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {routesList.map((route) => {
            const pax = Number(route.passengersMonthly || (route as any).monthlyPassengers || 250000)
            const paxDisplay = isNaN(pax) || pax <= 0 ? '250k' : `${Math.round(pax / 1000)}k`
            const rawWeight = Number(route.dgcaWeight)
            const weight = isNaN(rawWeight) || rawWeight <= 0 ? 5.0 : rawWeight
            const weightDisplay = weight < 1 && weight > 0 ? (weight * 100).toFixed(1) : weight.toFixed(1)
            return (
              <div key={route.route} className="space-y-2 rounded-xl border border-[#26364c] bg-[#0c1727] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-[#122035]">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{route.route}</span>
                  <span className="rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 text-[11px] font-bold px-2 py-0.5">
                    w = {weightDisplay}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Monthly Pax:</span>
                  <span className="font-semibold text-slate-200">{paxDisplay}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Top Carrier:</span>
                  <span className="font-semibold text-slate-200">{route.topCarrier || 'IndiGo'}</span>
                </div>
                <div className="w-full bg-[#26364c] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, weight * 5))}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
