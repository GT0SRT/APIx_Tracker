import { useState } from 'react'
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Database,
  Download,
  Gauge,
  LayoutDashboard,
  Map,
  Menu,
  Plane,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Table2,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const trendData = [
  { day: '04 Aug', apix: 135.4, baseline: 132.2 },
  { day: '06 Aug', apix: 136.8, baseline: 132.5 },
  { day: '08 Aug', apix: 137.1, baseline: 132.8 },
  { day: '10 Aug', apix: 139.5, baseline: 133.1 },
  { day: '12 Aug', apix: 138.7, baseline: 133.3 },
  { day: '14 Aug', apix: 140.8, baseline: 133.6 },
  { day: '16 Aug', apix: 139.9, baseline: 134.1 },
  { day: '18 Aug', apix: 141.2, baseline: 134.4 },
  { day: '20 Aug', apix: 142.5, baseline: 134.8 },
]

const elasticityData = [
  { window: 'T+1', fare: 8450, change: '+31%' },
  { window: 'T+7', fare: 6820, change: '+6%' },
  { window: 'T+15', fare: 5940, change: '-8%' },
  { window: 'T+30', fare: 5480, change: '-15%' },
  { window: 'T+45', fare: 5320, change: '-18%' },
]

const routeData = [
  { route: 'DEL-BOM', fare: 6820 },
  { route: 'DEL-BLR', fare: 6410 },
  { route: 'MAA-DEL', fare: 5980 },
  { route: 'BLR-HYD', fare: 4620 },
  { route: 'DEL-CCU', fare: 5740 },
]

const fareBreakdown = [
  { name: 'Base Fare', value: 68, color: '#2563eb' },
  { name: 'Taxes', value: 21, color: '#38bdf8' },
  { name: 'UDF', value: 7, color: '#f59e0b' },
  { name: 'Convenience', value: 4, color: '#94a3b8' },
]

const feedData = [
  ['DEL', 'BOM', 'IndiGo', '22 Aug 2024', 'T+7', '₹5,420', '₹1,184', '₹6,604'],
  ['BLR', 'DEL', 'Air India', '24 Aug 2024', 'T+15', '₹6,180', '₹1,296', '₹7,476'],
  ['BOM', 'BLR', 'Akasa Air', '21 Aug 2024', 'T+1', '₹8,920', '₹1,562', '₹10,482'],
  ['DEL', 'CCU', 'IndiGo', '25 Aug 2024', 'T+30', '₹4,860', '₹1,040', '₹5,900'],
  ['MAA', 'DEL', 'Air India', '23 Aug 2024', 'T+45', '₹5,120', '₹1,116', '₹6,236'],
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Price Index', icon: TrendingUp },
  { label: 'Route Analysis', icon: Map },
  { label: 'Data Explorer', icon: Table2 },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>{children}</section>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((entry) => <p key={entry.name} style={{ color: entry.color }}>{entry.name}: {entry.value}</p>)}
    </div>
  )
}

function ChartExportButton() {
  return <button type="button" title="Export Chart as PNG/CSV" aria-label="Export Chart as PNG/CSV" className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-sky-600"><Download className="h-4 w-4" /></button>
}

export default function App() {
  const [range, setRange] = useState('Daily')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [origin, setOrigin] = useState('DEL')
  const [destination, setDestination] = useState('BOM')
  const [airline, setAirline] = useState('All airlines')
  const [startDate, setStartDate] = useState('2024-08-04')
  const [endDate, setEndDate] = useState('2024-08-20')
  const [appliedRoute, setAppliedRoute] = useState('DEL-BOM')

  const applyFilters = () => setAppliedRoute(`${origin}-${destination}`)
  const routeFare = appliedRoute === 'DEL-BOM' ? '₹6,820' : appliedRoute === 'DEL-BLR' ? '₹6,410' : appliedRoute === 'BLR-HYD' ? '₹4,620' : '₹5,980'
  const filteredTrendData = trendData.map((point, index) => ({ ...point, apix: point.apix + (appliedRoute === 'DEL-BOM' ? 0 : (index % 3) * 0.9 - 0.4) }))

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#D5DFEA]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#193550] bg-[#0B1F36] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-[#193550] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400 text-[#0c2340]"><Plane className="h-5 w-5" /></div>
          <div><p className="text-sm font-bold tracking-wide">APIx Tracker</p><p className="text-[10px] uppercase tracking-[0.2em] text-sky-200/70">MoSPI / RBI</p></div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-4 py-6"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p><nav className="space-y-1">{navItems.map(({ label, icon: Icon, active }) => <button key={label} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-[#08B5F5] text-[#062033]' : 'text-[#D5DFEA] hover:bg-[#122B46] hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>)}</nav></div>
        <div className="mt-auto space-y-1 px-4 pb-5"><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10"><Settings2 className="h-4 w-4" />Settings</button><div className="mt-5 border-t border-[#193550] pt-4"><div className="flex items-center gap-3 px-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800">AS</div><div><p className="text-xs font-semibold">Analyst Services</p><p className="text-[10px] text-slate-400">MoSPI / Government of India</p></div></div></div></div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-[#193550] bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-base font-bold text-slate-900 md:text-lg">Airfare Price Index (APIx) Dashboard</h1><span className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold tracking-wide text-sky-700">SIH 26056</span></div><p className="mt-0.5 hidden text-xs text-slate-500 sm:block">Real-time airfare inflation monitoring for India</p></div></div>
          <div className="flex items-center gap-2 md:gap-4"><div className="hidden items-center gap-2 rounded-lg border border-[#193550] px-3 py-2 text-xs font-medium text-slate-600 md:flex"><span className="h-2 w-2 rounded-full bg-sky-500" />View: Macro Index</div><button className="hidden rounded-lg border border-[#193550] p-2 text-slate-500 hover:bg-slate-50 sm:block" aria-label="Notifications"><Bell className="h-4 w-4" /></button><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><select value={range} onChange={(e) => setRange(e.target.value)} className="appearance-none rounded-lg border border-[#193550] bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-sky-500"><option>Daily</option><option>Weekly</option><option>Monthly</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400" /></div></div>
        </header>

        <div className="border-b border-[#193550] bg-white px-4 py-4 md:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-xs font-semibold text-slate-600">Origin City<select value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-sky-500"><option>DEL</option><option>BOM</option><option>BLR</option><option>MAA</option></select></label>
              <label className="text-xs font-semibold text-slate-600">Destination City<select value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-sky-500"><option>BOM</option><option>BLR</option><option>CCU</option><option>DEL</option><option>HYD</option></select></label>
              <label className="text-xs font-semibold text-slate-600">Start Date<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500" /></label>
              <label className="text-xs font-semibold text-slate-600">End Date<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500" /></label>
              <label className="text-xs font-semibold text-slate-600">Airline<select value={airline} onChange={(e) => setAirline(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-sky-500"><option>All airlines</option><option>IndiGo</option><option>Air India</option><option>Akasa Air</option></select></label>
            </div>
            <button type="button" onClick={applyFilters} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"><Search className="h-4 w-4" />Apply Filters</button>
          </div>
        </div>

        <div className="space-y-6 p-4 md:p-8">
          <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">National indicator</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Market overview</h2></div><div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Data pipeline operational <RefreshCw className="ml-1 h-3.5 w-3.5" /></div></div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Current APIx (Jevons Formula)', value: '142.5', meta: '+3.2% vs last month', icon: Gauge, accent: 'text-sky-600', positive: true },
              { label: 'Avg Base Fare (Selected Route)', value: routeFare, meta: `${appliedRoute} · ${airline}`, icon: CircleDollarSign, accent: 'text-indigo-600' },
              { label: 'Price Volatility Index', value: 'High', meta: `${appliedRoute} · 30-day range`, icon: Activity, accent: 'text-amber-600' },
              { label: 'Total Data Points (30d)', value: '145.2K', meta: 'Live standardized scrapes', icon: Database, accent: 'text-emerald-600' },
            ].map(({ label, value, meta, icon: Icon, accent, positive }) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div><div className={`rounded-lg bg-slate-50 p-2.5 ${accent}`}><Icon className="h-5 w-5" /></div></div><div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">{positive && <span className="font-bold text-emerald-600">+2.4%</span>}<span>{positive ? 'vs last month' : meta}</span></div></Card>)}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-5"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold text-slate-900">30-Day APIx Inflation Trend</h3><p className="mt-1 text-xs text-slate-500">{appliedRoute} APIx movement · Last 30 days</p></div><div className="flex items-center gap-2"><div className="flex items-center gap-3 text-[10px] text-slate-500"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-sky-500" />APIx</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-slate-300" />Baseline</span></div><ChartExportButton /></div></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><RechartsLineChart data={filteredTrendData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="#e8eef5" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} /><YAxis domain={[130, 145]} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} /><Tooltip content={<ChartTooltip />} /><Line type="monotone" dataKey="apix" name="APIx" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} /><Line type="monotone" dataKey="baseline" name="Baseline" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} /></RechartsLineChart></ResponsiveContainer></div></Card>
            <Card className="p-5"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold text-slate-900">Lead-Time Elasticity</h3><p className="mt-1 text-xs text-slate-500">Average fare by advance-purchase window</p></div><div className="flex items-center gap-2"><span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">INR</span><ChartExportButton /></div></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={elasticityData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}><CartesianGrid stroke="#e8eef5" vertical={false} /><XAxis dataKey="window" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="fare" name="Avg. fare" fill="#2563eb" radius={[5, 5, 0, 0]} barSize={34} /></BarChart></ResponsiveContainer></div></Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <Card className="p-5"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold text-slate-900">Sector-Wise Route Comparison</h3><p className="mt-1 text-xs text-slate-500">Current average fares across top DGCA routes</p></div><ChartExportButton /></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={routeData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}><CartesianGrid stroke="#e8eef5" horizontal={false} /><XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} /><YAxis type="category" dataKey="route" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} tickLine={false} axisLine={false} width={66} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="fare" name="Avg. fare" fill="#38bdf8" radius={[0, 5, 5, 0]} barSize={25} /></BarChart></ResponsiveContainer></div></Card>
            <Card className="p-5"><div className="mb-2 flex items-start justify-between"><div><h3 className="font-bold text-slate-900">Average Fare Breakdown</h3><p className="mt-1 text-xs text-slate-500">Composition of a typical ticket price</p></div><ChartExportButton /></div><div className="flex items-center justify-center gap-5"><div className="h-44 w-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={fareBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">{fareBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="space-y-3">{fareBreakdown.map((entry) => <div key={entry.name} className="flex items-center justify-between gap-7 text-xs"><span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}</span><span className="font-bold text-slate-800">{entry.value}%</span></div>)}</div></div></Card>
          </div>

          <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><h3 className="font-bold text-slate-900">Live Scraper Logs &amp; Audit Trail</h3><p className="mt-1 text-xs text-slate-500">Latest standardized records and data provenance from the collection pipeline</p></div><div className="flex gap-2"><button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Download className="h-3.5 w-3.5" />Export</button><button className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"><RefreshCw className="h-3.5 w-3.5" />Refresh</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr>{['Origin', 'Destination', 'Carrier', 'Departure Date', 'Advance Window', 'Base Fare', 'Taxes', 'Total Fare', 'Status'].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{feedData.map((row, index) => <tr key={`${row[0]}-${row[1]}-${index}`} className="hover:bg-slate-50/70">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-600">{cellIndex === 8 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><ShieldCheck className="h-3 w-3" />Cleaned</span> : cell}</td>)}</tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500"><span>Showing 5 of 1,204,832 records</span><span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-emerald-500" />Updated 42 seconds ago</span></div></Card>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400"><span>APIx v1.4 · Data refreshed daily at 06:00 IST</span><span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />MoSPI secure analytics environment</span></footer>
        </div>
      </main>
    </div>
  )
}
