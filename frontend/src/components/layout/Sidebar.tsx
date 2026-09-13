import {
  Plane,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { TabType } from '../../types/apix'
import { navItems } from '../../data/navigation'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Institutional Deep Navy (#0B2545) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#153454] bg-[#0B2545] text-white transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#153454] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <Plane className="h-5 w-5 rotate-45" />
            </div>
            {!sidebarCollapsed && (
              <div className="transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold tracking-tight text-white leading-none">APIx Tracker</p>
                  <span className="rounded bg-blue-500/30 px-1 py-0.5 text-[9px] font-semibold text-blue-300">
                    SIH 2026
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-blue-200/80 font-medium mt-1">
                  Airfare Price Index
                </p>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            className="text-slate-400 hover:text-white lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse/Expand on desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 py-6 flex-1 overflow-y-auto space-y-4">
          {!sidebarCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Platform Navigation</p>
          )}
          <nav className="space-y-1.5">
            {navItems.map(({ id, label, icon: Icon, badge }) => {
              const active = activeTab === id
              const isAi = id === 'ai-intelligence'
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id)
                    setSidebarOpen(false)
                  }}
                  title={sidebarCollapsed ? label : undefined}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? isAi
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-[#133256] hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isAi && !active ? 'text-amber-400' : ''}`} />
                    {!sidebarCollapsed && <span className="truncate">{label}</span>}
                  </div>
                  {!sidebarCollapsed && badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : isAi
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-900/60 text-blue-200 border border-blue-700/50'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Authority Footer */}
        <div className="p-4 border-t border-[#153454] space-y-3 bg-[#081d38]">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm">
                GOI
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">MoSPI Analytics</p>
                <p className="text-[10px] text-slate-400 truncate">Team AndroMatrix · SIH26056</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                GOI
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
