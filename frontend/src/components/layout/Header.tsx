import {
  PanelLeft,
  HelpCircle,
  Bot,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TabType } from '../../types/apix'
import { navItems } from '../../data/navigation'
import { Badge } from '../common/CommonUI'

interface HeaderProps {
  activeTab: TabType
  setSidebarOpen: (open: boolean) => void
  onToggleAiCopilot?: () => void
  isAiCopilotOpen?: boolean
}

export function Header({
  activeTab,
  setSidebarOpen,
  onToggleAiCopilot,
  isAiCopilotOpen = false,
}: HeaderProps) {
  const navigate = useNavigate()

  const currentTabMeta = navItems.find((item) => item.id === activeTab) || navItems[0]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white px-4 sm:px-6 lg:px-8 shadow-2xs transition-all">
      {/* =====================================================
          LEFT — INSTITUTIONAL BRANDING & BREADCRUMB LOCKUP
          ===================================================== */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {/* Mobile sidebar toggle */}
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-xs lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Toggle navigation panel"
          title="Open navigation panel"
        >
          <PanelLeft className="h-4.5 w-4.5 text-slate-700" />
        </button>

        {/* Contextual Route Breadcrumb */}
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline">Platform</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-sm font-bold text-slate-900 truncate">
            {currentTabMeta.label}
          </span>

          {currentTabMeta.badge && (
            <Badge variant="blue" className="hidden lg:inline-flex ml-0.5">
              {currentTabMeta.badge}
            </Badge>
          )}
        </div>
      </div>

      {/* =====================================================
          RIGHT — PIPELINE HEARTBEAT & COPILOT
          ===================================================== */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Live Ingestion Heartbeat */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-2.5 sm:px-3 py-1 text-xs font-medium text-emerald-800 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="font-bold">Pipeline: Active</span>
        </div>

        {/* Dockable AI Copilot Drawer Trigger */}
        {onToggleAiCopilot && (
          <button
            onClick={onToggleAiCopilot}
            title="Toggle APIx AI Intelligence Copilot"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
              isAiCopilotOpen
                ? 'bg-[#0A1628] text-white border-[#15253D]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-[#0A1628]/5 hover:text-[#0A1628] hover:border-[#15253D]/30'
            }`}
          >
            <Bot className={`h-4 w-4 ${isAiCopilotOpen ? 'text-blue-300' : 'text-[#0A1628]'}`} />
            <span className="hidden sm:inline">AI Copilot</span>
            <span
              className={`hidden md:inline-flex text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                isAiCopilotOpen
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-blue-700 border border-blue-200/60'
              }`}
            >
              RAG
            </span>
          </button>
        )}

        {/* Help & Support Link */}
        <button
          onClick={() => navigate('/help-support')}
          title="Help & Support / MoSPI Documentation"
          aria-label="Help and Support"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

      </div>
    </header>
  )
}