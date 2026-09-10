import { useState, useRef, useEffect } from 'react'
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
  BookOpen,
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

// 30-Day trend comparing calculated APIx against baseline
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

// Advance Purchase Horizons (Slide 2 & 3: T+1, T+7, T+15, T+30, T+45)
const elasticityData = [
  { window: 'T+1', fare: 8450, change: '+31% (Surge)', isHighSurge: true },
  { window: 'T+7', fare: 6820, change: '+6%', isHighSurge: false },
  { window: 'T+15', fare: 5940, change: '-8%', isHighSurge: false },
  { window: 'T+30', fare: 5480, change: '-15%', isHighSurge: false },
  { window: 'T+45', fare: 5320, change: '-18%', isHighSurge: false },
]

// DGCA Top Routes (Slide 2: Passenger Traffic Weighted)
const routeData = [
  { route: 'DEL-BOM', fare: 6820, weight: '14.2%' },
  { route: 'DEL-BLR', fare: 6410, weight: '11.8%' },
  { route: 'MAA-DEL', fare: 5980, weight: '9.4%' },
  { route: 'DEL-CCU', fare: 5740, weight: '8.6%' },
  { route: 'BLR-HYD', fare: 4620, weight: '7.1%' },
]

// Deterministic Fare Decomposition (Slide 2: Base Fare + Taxes vs Add-ons)
const fareBreakdown = [
  { name: 'Base Fare', value: 68, color: '#1D4ED8' },
  { name: 'Fuel & Taxes (GST)', value: 21, color: '#0284C7' },
  { name: 'Airport Fee (UDF)', value: 7, color: '#EA580C' },
  { name: 'Convenience Fee', value: 4, color: '#94A3B8' },
]

// Real-time audit feed with SHA-256 provenance
const feedData = [
  ['DEL', 'BOM', 'IndiGo', '22 Aug 2024', 'T+7', '₹5,420', '₹1,184', '₹6,604', 'Cleaned (SHA-256)'],
  ['BLR', 'DEL', 'Air India', '24 Aug 2024', 'T+15', '₹6,180', '₹1,296', '₹7,476', 'Cleaned (SHA-256)'],
  ['BOM', 'BLR', 'Akasa Air', '21 Aug 2024', 'T+1', '₹8,920', '₹1,562', '₹10,482', 'Cleaned (SHA-256)'],
  ['DEL', 'CCU', 'IndiGo', '25 Aug 2024', 'T+30', '₹4,860', '₹1,040', '₹5,900', 'Cleaned (SHA-256)'],
  ['MAA', 'DEL', 'Air India', '23 Aug 2024', 'T+45', '₹5,120', '₹1,116', '₹6,236', 'Cleaned (SHA-256)'],
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

function ChartExportButton() {
  return (
    <button
      type="button"
      title="Export Chart as PNG/CSV"
      aria-label="Export Chart as PNG/CSV"
      className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-700"
    >
      <Download className="h-4 w-4" />
    </button>
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

  // Interactive Jevons Formula Popover State
  const [showJevonsModal, setShowJevonsModal] = useState(false)
  const [hoverJevons, setHoverJevons] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Formula Basket Modal (from Slide 3)
  const [showFormulaBasket, setShowFormulaBasket] = useState(false)

  // Close popover when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowJevonsModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyFilters = () => setAppliedRoute(`${origin}-${destination}`)
  const routeFare =
    appliedRoute === 'DEL-BOM' ? '₹6,820' : appliedRoute === 'DEL-BLR' ? '₹6,410' : appliedRoute === 'BLR-HYD' ? '₹4,620' : '₹5,980'
  const filteredTrendData = trendData.map((point, index) => ({
    ...point,
    apix: point.apix + (appliedRoute === 'DEL-BOM' ? 0 : (index % 3) * 0.9 - 0.4),
  }))

  const isJevonsVisible = showJevonsModal || hoverJevons

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased">
      {/* Sidebar - Matching Slide 4 Deep Navy theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#153454] bg-[#0B2545] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with SIH 2026 & AndroMatrix info */}
        <div className="flex h-20 items-center gap-3 border-b border-[#153454] px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
            <Plane className="h-5 w-5 rotate-45" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              AndroMatrix
              <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded">
                APIx
              </span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-blue-200/80 font-medium">SIH 2026 · PS 26056</p>
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
        <div className="px-3 py-6">
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

          {/* Quick Access to Formula Basket (Slide 3) */}
          <div className="mt-8 px-2">
            <button
              onClick={() => setShowFormulaBasket(true)}
              className="group flex w-full items-center gap-2.5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2.5 text-left text-xs font-semibold text-orange-200 hover:border-orange-500 hover:bg-orange-500/20 transition"
            >
              <BookOpen className="h-4 w-4 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Formula Basket (IMF/DGCA)</span>
            </button>
          </div>
        </div>

        {/* User / MoSPI Authority Footer */}
        <div className="mt-auto space-y-2 px-4 pb-5">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition">
            <Settings2 className="h-4 w-4" />
            Methodology Config
          </button>
          <div className="border-t border-[#153454] pt-3">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-xs font-bold text-white shadow-sm">
                AM
              </div>
              <div>
                <p className="text-xs font-bold text-white">Team AndroMatrix</p>
                <p className="text-[10px] text-slate-400">MoSPI · CPI Augmentation</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-64">
        {/* Top Header Bar */}
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                  Airfare Price Index (APIx) Dashboard
                </h1>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-blue-700 border border-blue-200">
                  SIH 2026 · PS 26056
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700 border border-orange-200">
                  Team AndroMatrix
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Real-Time Automated Airfare Scraping for CPI Augmentation (MoSPI / RBI)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Formula Basket Trigger Button */}
            <button
              onClick={() => setShowFormulaBasket(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50/80 px-3 py-1.5 text-xs font-semibold text-orange-800 hover:bg-orange-100 transition shadow-xs md:flex"
            >
              <BookOpen className="h-3.5 w-3.5 text-orange-600" />
              <span>Formula Basket</span>
            </button>

            {/* Pipeline Status Indicator */}
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

            {/* Range Selector */}
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

        {/* Dashboard Main Body */}
        <div className="space-y-6 p-4 md:p-8">
          {/* Section Heading with Operational Tag */}
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

          {/* 4 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Card 1: Current APIx with Interactive Jevons Formula Tooltip & Popover */}
            <Card className="relative p-5 border-l-4 border-l-blue-600">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current APIx</p>

                    {/* Information Icon - Hover & Click to View Jevons Formula */}
                    <div
                      className="relative inline-block"
                      ref={popoverRef}
                      onMouseEnter={() => setHoverJevons(true)}
                      onMouseLeave={() => setHoverJevons(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setShowJevonsModal(!showJevonsModal)}
                        className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                        aria-label="Information on Jevons Formula"
                        title="Click or hover to view Jevons Formula details"
                      >
                        <Info className="h-4 w-4" />
                      </button>

                      {/* Interactive Popover / Tooltip */}
                      {isJevonsVisible && (
                        <div
                          className="absolute left-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-xl border border-blue-200 bg-white p-4 shadow-2xl transition-all"
                          role="dialog"
                          aria-label="Jevons Formula Explanation"
                        >
                          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                                Elementary Micro-Index
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowJevonsModal(false)
                                setHoverJevons(false)
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              aria-label="Close popover"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="mt-3 space-y-2.5">
                            <h4 className="text-xs font-bold text-slate-900">Jevons Geometric Mean Formula:</h4>

                            {/* Mathematical formula container styled like Slide 3 */}
                            <div className="rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-center">
                              <p className="font-mono text-sm font-bold text-slate-900">
                                I<sub>J</sub>(t/0) = [ ∏<sub>i=1</sub><sup>n</sup> ( P<sub>i</sub>(t) / P<sub>i</sub>(0) ) ]<sup>1/n</sup>
                              </p>
                              <p className="mt-1 text-[10px] text-orange-800 font-medium">
                                Unweighted Geometric Mean of Price Relatives
                              </p>
                            </div>

                            <p className="text-[11px] leading-relaxed text-slate-600">
                              <strong className="text-slate-800">IMF CPI Manual (2020, Ch. 10)</strong> recommends the
                              Jevons index for web-scraped airline ticket quotes. It satisfies the multilateral time-reversal
                              and circularity tests, preventing upward substitution bias without requiring continuous intraday
                              quantity weighting.
                            </p>

                            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-700">Macro Aggregation:</span> Combines route micro-indices
                              using DGCA quarterly passenger traffic weights (w<sub>r</sub>):
                              <span className="block font-mono text-blue-700 font-bold mt-0.5">Macro APIx = ∑ w<sub>r</sub> · I<sub>r</sub>(t/0)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

            {/* Card 2: Avg Base Fare - Matching Slide 2 Warm Orange */}
            <Card className="p-5 border-l-4 border-l-orange-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Base Fare (Selected)</p>
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

            {/* Card 3: Price Volatility Index */}
            <Card className="p-5 border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Volatility Index</p>
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

            {/* Card 4: Total Standardized Data Points - Matching Slide 2 Emerald Green */}
            <Card className="p-5 border-l-4 border-l-emerald-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Standardized Scrapes (30d)</p>
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

          {/* Charts Row 1: Inflation Trend & Lead-Time Elasticity */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Chart 1: 30-Day APIx Inflation Trend */}
            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">30-Day APIx Inflation Trend</h3>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      Jevons Formula
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{appliedRoute} airfare price movement vs constant baseline</p>
                </div>
                <div className="flex items-center gap-3">
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
                  <ChartExportButton />
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

            {/* Chart 2: Lead-Time Elasticity (Advance Purchase Horizons from Slide 2) */}
            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Lead-Time Elasticity Basket</h3>
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                      Constant-Horizon
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Synthetic constant-horizon pricing across T+1, T+7, T+15, T+30, T+45 windows
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-200">
                    INR (₹)
                  </span>
                  <ChartExportButton />
                </div>
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

          {/* Charts Row 2: Route Weighting & Fare Decomposition */}
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            {/* Sector-Wise Route Comparison */}
            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">DGCA Traffic-Weighted Routes</h3>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      Quarterly Weights
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Current average fares across top DGCA city pairs</p>
                </div>
                <ChartExportButton />
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

            {/* Average Fare Breakdown (Slide 2 Deterministic Fare Decomposition) */}
            <Card className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Fare Decomposition</h3>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Pure Inflation
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Stripping voluntary add-ons to isolate transport inflation</p>
                </div>
                <ChartExportButton />
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

          {/* Live Scraper Logs & Audit Trail - Styled matching Slide 4 Dark Navy Table Header */}
          <Card className="overflow-hidden border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">Live Scraper Logs &amp; Provenance Trail</h3>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    SHA-256 Immutable Audit
                  </span>
                </div>
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
                {/* Deep Navy table header directly inspired by Slide 4 */}
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
                      'Audit Status',
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

          {/* Footer with Hackathon & Authority credits */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">AndroMatrix APIx v2.0</span>
              <span>·</span>
              <span>Smart India Hackathon 2026 (Problem Statement 26056)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>MoSPI / RBI Consumer Price Index (CPI) Augmentation Platform</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Formula Basket Full-Screen Drawer / Modal (Slide 3 representation) */}
      {showFormulaBasket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="max-w-2xl w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800 uppercase tracking-wider">
                  Two-Tier Price Index Formulation
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">AndroMatrix APIx Formula Basket</h3>
                <p className="text-xs text-slate-500">IMF CPI Manual (2020) &amp; DGCA Traffic Weighting Framework</p>
              </div>
              <button
                onClick={() => setShowFormulaBasket(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Formula 1: Jevons Micro-Index */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-blue-950">1. Jevons Micro-Index (Elementary Aggregate)</h4>
                  <span className="rounded bg-blue-200/80 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    Route Level
                  </span>
                </div>
                <div className="my-3 rounded-lg border border-blue-200 bg-white p-3 text-center">
                  <p className="font-mono text-base font-bold text-blue-900">
                    I<sub>J</sub>(t/0) = [ ∏<sub>i=1</sub><sup>n</sup> ( P<sub>i</sub>(t) / P<sub>i</sub>(0) ) ]<sup>1/n</sup>
                  </p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Computes the unweighted geometric mean of price relatives across sampled airline routes. By taking logarithms,
                  it treats price increases and decreases symmetrically, avoiding the upward substitution bias inherent in the
                  Carli arithmetic formula.
                </p>
              </div>

              {/* Formula 2: Macro APIx Weighted Aggregate */}
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-orange-950">2. Macro APIx (National Weighted Index)</h4>
                  <span className="rounded bg-orange-200/80 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                    National Level
                  </span>
                </div>
                <div className="my-3 rounded-lg border border-orange-200 bg-white p-3 text-center">
                  <p className="font-mono text-base font-bold text-orange-950">
                    Macro APIx = ∑<sub>r</sub> w<sub>r</sub> · I<sub>r</sub>(t/0)
                  </p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Where <span className="font-semibold font-mono">w<sub>r</sub></span> is the quarterly passenger traffic share
                  of route <span className="font-mono font-semibold">r</span> from official DGCA city-pair statistics, ensuring trunk
                  routes like DEL-BOM carry proportional macroeconomic impact over regional UDAN routes.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFormulaBasket(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Close Formulation Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
