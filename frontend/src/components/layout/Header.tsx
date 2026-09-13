import {
  Menu,
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import type { TabType } from '../../types/apix'
import { navItems } from '../../data/navigation'

interface HeaderProps {
  activeTab: TabType
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarOpen: (open: boolean) => void
  range: string
  setRange: (range: string) => void
  onOpenReportModal: () => void
  onNavigateToAi: (subTab: 'ml' | 'agent' | 'rag') => void
  anomalyCount: number
}

export function Header({
  activeTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  setSidebarOpen,
  range,
  setRange,
  onOpenReportModal,
  onNavigateToAi,
  anomalyCount,
}: HeaderProps) {
  const currentTabMeta = navItems.find((item) => item.id === activeTab) || navItems[0]

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur shadow-xs">
      <div className="flex items-center gap-3">
        <button
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          onClick={() => {
            if (window.innerWidth < 1024) {
              setSidebarOpen(true)
            } else {
              setSidebarCollapsed(!sidebarCollapsed)
            }
          }}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              {activeTab === 'overview' ? 'Airfare Price Index (APIx) Dashboard' : currentTabMeta.label}
            </h1>
            {currentTabMeta.badge && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                {currentTabMeta.badge}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{currentTabMeta.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Ingestion Heartbeat */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Pipeline: Active (6h Ingestion)
        </div>

        {/* Policy & Compliance RAG quick jump */}
        <button
          onClick={() => onNavigateToAi('rag')}
          title="Open MoSPI / DGCA Policy Q&A Assistant"
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
          <span>Policy Q&amp;A</span>
        </button>

        {/* One-Click Executive Report Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">One-Click</span> Report
          <Sparkles className="h-3 w-3 text-amber-300" />
        </button>

        {/* Notifications & Agentic Alert Counter */}
        <button
          onClick={() => onNavigateToAi('agent')}
          className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          aria-label="Agentic Anomaly Alerts"
          title="24/7 Agentic Anomaly Alerts"
        >
          <Bell className="h-4 w-4" />
          {anomalyCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {anomalyCount}
            </span>
          )}
        </button>

        {/* Aggregation Frequency Selector */}
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-xs"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  )
}
