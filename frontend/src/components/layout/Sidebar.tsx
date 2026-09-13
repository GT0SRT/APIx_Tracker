import {
  Plane,
  X,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
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
  openAiModal: (type: 'forecasting' | 'agentic' | 'rag' | 'report') => void
}

export function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  openAiModal,
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

      {/* Sidebar - Deep Navy Theme (#0B2545) */}
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
        <div className="px-3 py-5 flex-1 overflow-y-auto space-y-4">
          <div>
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Platform Menu</p>
            )}
            <nav className="space-y-1">
              {navItems.slice(0, 5).map(({ id, label, icon: Icon, badge }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id)
                      setSidebarOpen(false)
                    }}
                    title={sidebarCollapsed ? label : undefined}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                        : 'text-slate-300 hover:bg-[#133256] hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{label}</span>}
                    </div>
                    {!sidebarCollapsed && badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        active ? 'bg-white/20 text-white' : 'bg-blue-900/60 text-blue-200 border border-blue-700/50'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Advanced Capabilities Section */}
          <div className="pt-2 border-t border-[#153454]">
            {!sidebarCollapsed && (
              <div className="px-3 flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Advanced AI
                </p>
              </div>
            )}
            <nav className="space-y-1">
              {navItems.slice(5).map(({ id, label, icon: Icon, badge }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id)
                      setSidebarOpen(false)
                    }}
                    title={sidebarCollapsed ? label : undefined}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'text-amber-200/90 hover:bg-[#133256] hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="h-4 w-4 shrink-0 text-amber-400" />
                      {!sidebarCollapsed && <span className="truncate">{label}</span>}
                    </div>
                    {!sidebarCollapsed && badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Quick AI Agentic Trigger Box on Desktop */}
          {!sidebarCollapsed && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-semibold">
                <Bot className="h-4 w-4 text-emerald-400" />
                <span>Autonomous Agentic Hub</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                24/7 root-cause diagnostics & policy compliance assistant.
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => openAiModal('agentic')}
                  className="rounded bg-blue-600/80 hover:bg-blue-600 px-2 py-1 text-[10px] font-bold text-white text-center cursor-pointer transition"
                >
                  Anomaly Agent
                </button>
                <button
                  onClick={() => openAiModal('rag')}
                  className="rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200 text-center cursor-pointer transition"
                >
                  Policy RAG
                </button>
              </div>
            </div>
          )}
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
