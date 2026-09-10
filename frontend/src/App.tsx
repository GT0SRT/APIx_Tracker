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
  Info,
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

// 30-Day trend: APIx vs Baseline
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

// Advance Purchase Horizons
const elasticityData = [
  { window: 'T+1', fare: 8450, change: '+31%', isHighSurge: true },
  { window: 'T+7', fare: 6820, change: '+6%', isHighSurge: false },
  { window: 'T+15', fare: 5940, change: '-8%', isHighSurge: false },
  { window: 'T+30', fare: 5480, change: '-15%', isHighSurge: false },
  { window: 'T+45', fare: 5320, change: '-18%', isHighSurge: false },
]

// DGCA Top Routes
const routeData = [
  { route: 'DEL-BOM', fare: 6820 },
  { route: 'DEL-BLR', fare: 6410 },
  { route: 'MAA-DEL', fare: 5980 },
  { route: 'DEL-CCU', fare: 5740 },
  { route: 'BLR-HYD', fare: 4620 },
]

// Deterministic Fare Decomposition (Base Fare + Taxes vs Add-ons)
const fareBreakdown = [
  { name: 'Base Fare', value: 68, color: '#1D4ED8' },
  { name: 'Fuel & Taxes', value: 21, color: '#0284C7' },
  { name: 'Airport Fee (UDF)', value: 7, color: '#EA580C' },
  { name: 'Convenience Fee', value: 4, color: '#94A3B8' },
]

// Real-time audit feed
const feedData = [
  ['DEL', 'BOM', 'IndiGo', '22 Aug 2024', 'T+7', '₹5,420', '₹1,184', '₹6,604', 'Cleaned'],
  ['BLR', 'DEL', 'Air India', '24 Aug 2024', 'T+15', '₹6,180', '₹1,296', '₹7,476', 'Cleaned'],
  ['BOM', 'BLR', 'Akasa Air', '21 Aug 2024', 'T+1', '₹8,920', '₹1,562', '₹10,482', 'Cleaned'],
  ['DEL', 'CCU', 'IndiGo', '25 Aug 2024', 'T+30', '₹4,860', '₹1,040', '₹5,900', 'Cleaned'],
  ['MAA', 'DEL', 'Air India', '23 Aug 2024', 'T+45', '₹5,120', '₹1,116', '₹6,236', 'Cleaned'],
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Price Index', icon: TrendingUp },
  { label: 'Route Analysis', icon: Map },
  { label: 'Data Explorer', icon: Table2 },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
      {children}
    </section>
  )
}

function MetricInfo({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-0.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
        aria-label="Information"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-64 rounded-lg border border-slate-200 bg-slate-900 text-white p-2.5 text-[11px] leading-relaxed shadow-xl z-50">
          {text}
        </div>
      )}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-semibold text-slate-800">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
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
  const routeFare =
    appliedRoute === 'DEL-BOM' ? '₹6,820' : appliedRoute === 'DEL-BLR' ? '₹6,410' : appliedRoute === 'BLR-HYD' ? '₹4,620' : '₹5,980'
  const filteredTrendData = trendData.map((point, index) => ({
    ...point,
    apix: point.apix + (appliedRoute === 'DEL-BOM' ? 0 : (index % 3) * 0.9 - 0.4),
  }))

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased">
      {/* Sidebar - Deep Navy theme (#0B2545) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#153454] bg-[#0B2545] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-[#153454] px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
            <Plane className="h-5 w-5 rotate-45" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">APIx Tracker</p>
            <p className="text-[10px] uppercase tracking-wider text-blue-200/80 font-medium">Transport Price Index</p>
          </div>
          <button
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 py-6 flex-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                    : 'text-slate-300 hover:bg-[#133256] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Authority Footer */}
        <div className="p-4 border-t border-[#153454] space-y-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition">
            <Settings2 className="h-4 w-4" />
            Methodology Config
          </button>
          <div className="flex items-center gap-3 px-2 pt-1 border-t border-[#153454]/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
              GOI
            </div>
            <div>
              <p className="text-xs font-bold text-white">MoSPI Analytics</p>
              <p className="text-[10px] text-slate-400">CPI Augmentation Division</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                Airfare Price Index (APIx) Dashboard
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Real-time airfare inflation monitoring for India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Pipeline: Active (6h)
            </div>

            <button
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8 shadow-xs">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-xs font-semibold text-slate-600">
                Origin City
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option>DEL</option>
                  <option>BOM</option>
                  <option>BLR</option>
                  <option>MAA</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Destination City
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option>BOM</option>
                  <option>BLR</option>
                  <option>CCU</option>
                  <option>DEL</option>
                  <option>HYD</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-600"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                End Date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-600"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Airline
                <select
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option>All airlines</option>
                  <option>IndiGo</option>
                  <option>Air India</option>
                  <option>Akasa Air</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={applyFilters}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6 p-4 md:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">National Indicator</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Market Overview</h2>
            </div>
            <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Data pipeline operational · Scraped 42s ago
              <RefreshCw className="ml-1 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* 4 Metric Cards with Short, Punchy Tooltips */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Card 1: Current APIx */}
            <Card className="p-5 border-l-4 border-l-blue-600">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current APIx</p>
                    <MetricInfo text="Calculated using the Jevons Geometric Mean across routes to prevent dynamic surge substitution bias (IMF CPI standard)." />
                  </div>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">142.5</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
                  <Gauge className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-bold text-emerald-600">+2.4%</span>
                <span>vs baseline (30d moving avg)</span>
              </div>
            </Card>

            {/* Card 2: Avg Base Fare */}
            <Card className="p-5 border-l-4 border-l-orange-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Base Fare</p>
                    <MetricInfo text="Pure base airfare isolating transport price inflation by stripping taxes, UDF, and voluntary add-ons." />
                  </div>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{routeFare}</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600 border border-orange-100">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{appliedRoute}</span>
                <span>·</span>
                <span>{airline}</span>
              </div>
            </Card>

            {/* Card 3: Volatility Index */}
            <Card className="p-5 border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Volatility Index</p>
                    <MetricInfo text="30-day dynamic price dispersion and surge frequency, filtered via IQR outlier suppression." />
                  </div>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">High</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 border border-amber-100">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-amber-700">30-day dynamic surge</span>
                <span>·</span>
                <span>IQR Filter Active</span>
              </div>
            </Card>

            {/* Card 4: Standardized Scrapes */}
            <Card className="p-5 border-l-4 border-l-emerald-600">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Standardized Scrapes</p>
                    <MetricInfo text="Total validated flight price quotes ingested across top DGCA routes with SHA-256 cryptographic provenance." />
                  </div>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">145.2K</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
                  <Database className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-bold text-emerald-600">100% SHA-256</span>
                <span>verified clean records</span>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">30-Day APIx Inflation Trend</h3>
                  <p className="mt-1 text-xs text-slate-500">{appliedRoute} airfare price movement vs constant baseline</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    APIx
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    Baseline
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={filteredTrendData} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[130, 145]} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="apix"
                      name="APIx"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline"
                      stroke="#94A3B8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Lead-Time Elasticity Basket</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Synthetic constant-horizon pricing across T+1, T+7, T+15, T+30, T+45 windows
                  </p>
                </div>
                <span className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-200">
                  INR (₹)
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={elasticityData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="window" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="fare" name="Avg Fare" radius={[6, 6, 0, 0]} barSize={34}>
                      {elasticityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isHighSurge ? '#EA580C' : '#2563EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <Card className="p-5">
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 text-base">DGCA Traffic-Weighted Routes</h3>
                <p className="mt-1 text-xs text-slate-500">Current average fares across top domestic routes</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeData} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="route"
                      tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="fare" name="Avg Fare" fill="#0284C7" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-2">
                <h3 className="font-bold text-slate-900 text-base">Fare Decomposition</h3>
                <p className="mt-1 text-xs text-slate-500">Stripping voluntary add-ons to isolate pure transport inflation</p>
              </div>
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fareBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {fareBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5">
                  {fareBreakdown.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-6 text-xs">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                      </span>
                      <span className="font-bold text-slate-900">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Live Scraper Logs */}
          <Card className="overflow-hidden border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Live Scraper Logs &amp; Provenance Trail</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Standardized extraction records from automated Playwright ingestion pipeline
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-[#0B2545] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-900 transition">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Live Sync
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-[#0B2545] text-white text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    {[
                      'Origin',
                      'Destination',
                      'Carrier',
                      'Departure Date',
                      'Advance Horizon',
                      'Base Fare',
                      'Taxes',
                      'Total Fare',
                      'Status',
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-3.5 font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {feedData.map((row, index) => (
                    <tr key={`${row[0]}-${row[1]}-${index}`} className="hover:bg-blue-50/40 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`} className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-700">
                          {cellIndex === 8 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              {cell}
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 font-medium">
              <span>Showing 5 of 1,204,832 verified records</span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                Pipeline synchronized with NeonDB PostgreSQL
              </span>
            </div>
          </Card>

          {/* Footer */}
          <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <p>APIx Tracker v2.0 · National Transport Inflation Platform</p>
            <p>Ministry of Statistics and Programme Implementation (MoSPI)</p>
          </footer>
        </div>
      </main>
    </div>
  )
}
