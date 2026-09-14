import { PanelLeft, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TabType } from '../../types/apix'
import { navItems } from '../../data/navigation'

interface HeaderProps {
  activeTab: TabType
  setSidebarOpen: (open: boolean) => void
}

export function Header({
  activeTab,
  setSidebarOpen,
}: HeaderProps) {
  const navigate = useNavigate()
  const currentTabMeta = navItems.find((item) => item.id === activeTab) || navItems[0]

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar panel toggle */}
        <button
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Toggle navigation panel"
          title="Open navigation panel"
        >
          <PanelLeft className="h-5 w-5 text-blue-600" />
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
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Pipeline: Active
        </div>

        {/* Help & Support Route Link (Icon only) */}
        <button
          onClick={() => navigate('/help-support')}
          title="Help & Support / MoSPI Documentation"
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition cursor-pointer shadow-xs"
          aria-label="Help and Support"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
