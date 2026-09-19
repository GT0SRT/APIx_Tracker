import { useRef, useState } from 'react'
import {
  PlaneTakeoff,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TabType } from '../../types/apix'
import { navItems } from '../../data/navigation'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  sidebarWidth?: number
  setSidebarWidth?: (width: number) => void
}

export function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  sidebarWidth = 260,
  setSidebarWidth,
}: SidebarProps) {
  const navigate = useNavigate()
  const { isAuthenticated, user, openLoginModal, logout } = useAuth()

  const isDraggingRef = useRef(false)
  const [isResizing, setIsResizing] = useState(false)

  // Drag handler for interactive sidebar width resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return
      const clampedWidth = Math.min(Math.max(event.clientX, 200), 420)
      setSidebarWidth?.(clampedWidth)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Public tabs accessible to all citizens; all other tabs require administrator authorization
  const publicTabIds: TabType[] = ['overview', 'help-support']

  const handleNavClick = (id: TabType) => {
    const isProtected = !publicTabIds.includes(id)
    if (!isAuthenticated && isProtected) {
      openLoginModal()
      return
    }
    setActiveTab(id)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Sovereign Ashoka Navy (#0A1628) with Bento Minimalism */}
      <aside
        style={{
          width: sidebarCollapsed ? undefined : `${sidebarWidth}px`,
        }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#15253D] bg-[#0A1628] text-slate-100 ${
          isResizing ? 'transition-none select-none' : 'transition-[width] duration-200 ease-out'
        } shadow-2xl lg:shadow-none ${
          sidebarCollapsed ? 'lg:w-20' : ''
        } ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-20 items-center border-b border-[#15253D] transition-all ${
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {sidebarCollapsed ? (
            /* Collapsed State Toggle */
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#13233A] text-blue-400 hover:bg-blue-600 hover:text-white border border-[#1E3658] transition-all cursor-pointer group shadow-sm hover:scale-105 active:scale-95"
              title="Expand sidebar panel"
              aria-label="Expand sidebar panel"
            >
              <PanelLeftOpen className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>
          ) : (
            /* Expanded Brand State */
            <>
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-600/30">
                  <PlaneTakeoff className="h-5.5 w-5.5 text-white" />
                </div>
                <div className="transition-opacity duration-200 min-w-0">
                  <p className="text-base font-extrabold tracking-tight text-white leading-none truncate">
                    APIx Tracker
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-blue-300/80 font-bold mt-1.5 truncate">
                    Airfare Price Index
                  </p>
                </div>
              </div>

              {/* Close on mobile */}
              <button
                className="text-slate-400 hover:text-white lg:hidden cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Actions on desktop */}
              <div className="hidden lg:flex items-center gap-1 shrink-0">
                {/* Width Preset Cycle Button */}
                {/* <button
                  onClick={cycleWidthPreset}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title={`Sidebar Width: ${sidebarWidth}px (${getWidthPresetName(sidebarWidth)})\nClick to cycle: Compact (220px) → Standard (260px) → Wide (340px)\nOr drag right edge to adjust`}
                  aria-label="Manage sidebar width"
                >
                  <SlidersHorizontal className="h-4 w-4 text-blue-300" />
                </button> */}

                {/* Collapse button on desktop */}
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Collapse sidebar panel"
                  aria-label="Collapse sidebar panel"
                >
                  <PanelLeftClose className="h-4.5 w-4.5 text-blue-300" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items - Scrollbar hidden cross-browser while keeping scrolling functional */}
        <div className="px-3.5 py-5 flex-1 overflow-y-auto scrollbar-none no-scrollbar space-y-4">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-2 mb-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400/90">
                {isAuthenticated ? 'Platform Modules' : 'Public & Protected'}
              </p>
              {!isAuthenticated && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#13233A] px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-[#1E3658]">
                  <Lock className="h-2.5 w-2.5 text-amber-400" /> 5 Locked
                </span>
              )}
            </div>
          )}

          <nav className="space-y-1.5">
            {navItems.map(({ id, label, icon: Icon, badge }) => {
              const active = activeTab === id
              const isAi = id === 'ai-intelligence'
              const isProtected = !publicTabIds.includes(id)
              const isLocked = !isAuthenticated && isProtected

              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  title={
                    sidebarCollapsed
                      ? isLocked
                        ? `${label} (Admin Required)`
                        : label
                      : undefined
                  }
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? isAi
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : isLocked
                      ? 'text-slate-400 hover:bg-[#112035] hover:text-slate-200'
                      : 'text-slate-300 hover:bg-[#13233A] hover:text-white hover:translate-x-0.5'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                        isAi && !active ? 'text-amber-400' : ''
                      } ${isLocked ? 'text-slate-500 group-hover:text-slate-400' : ''}`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{label}</span>}
                  </div>

                  {!sidebarCollapsed && (
                    isLocked ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Lock className="h-2.5 w-2.5 text-amber-400" />
                        <span>Locked</span>
                      </span>
                    ) : badge ? (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          active
                            ? 'bg-white/20 text-white'
                            : isAi
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-[#192E4C] text-blue-200 border border-blue-500/20'
                        }`}
                      >
                        {badge}
                      </span>
                    ) : null
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* =====================================================
            INSTITUTIONAL ACCOUNT & AUTHENTICATION MODULE
            ===================================================== */}
        <div className="border-t border-slate-800/80 bg-[#07101D] p-3.5 space-y-2.5">
          {isAuthenticated ? (
            !sidebarCollapsed ? (
              <div className="space-y-2.5">
                {/* Account Status Info Card */}
                <div
                  className="w-full flex items-center gap-3 p-2 rounded-xl bg-[#0D1B2D]/80 border border-blue-900/30 text-left"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                    {/* Live active indicator pulse */}
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#07101D]" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white tracking-tight truncate">
                        Admin Session
                      </p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <p
                      className="text-[11px] text-slate-400 font-mono tracking-tight truncate select-all mt-0.5"
                      title={user?.email || 'admin@mospi.gov.in'}
                    >
                      {user?.email || 'admin@mospi.gov.in'}
                    </p>
                  </div>
                </div>

                {/* Redesigned Full-Width Logout Button */}
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/50 text-red-400 hover:text-red-300 px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer group active:scale-[0.98]"
                  title="Logout and lock protected platform modules"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-400 group-hover:text-red-300 transition-transform group-hover:-translate-x-0.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Collapsed Authenticated Mode */
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )
          ) : (
            !sidebarCollapsed ? (
              /* Unauthenticated / Logged Out State */
              <div className="space-y-2.5">
                {/* Guest Session Status Info */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                    <Lock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200 tracking-tight">
                      Public Session
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Guest / Unauthenticated
                    </p>
                  </div>
                </div>

                {/* Direct Admin Login Button */}
                <button
                  onClick={openLoginModal}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm shadow-blue-600/25"
                  title="Authenticate with official MoSPI credentials"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Admin Login</span>
                </button>
              </div>
            ) : (
              /* Collapsed Unauthenticated Mode */
              <div className="flex justify-center">
                <button
                  onClick={openLoginModal}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer active:scale-95 shadow-sm shadow-blue-600/30"
                  title="Admin Login (Protected Modules)"
                >
                  <LogIn className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </div>

        {/* =====================================================
            DRAGGABLE RESIZE HANDLE (Right Border on Desktop)
            ===================================================== */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setSidebarWidth?.(260)}
            title="Drag horizontally to adjust sidebar width (Double-click to reset to 260px)"
            className={`hidden lg:flex absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 items-center justify-center group ${
              isResizing ? 'bg-blue-500/20' : 'hover:bg-blue-500/10'
            } transition-colors`}
          >
            <div
              className={`w-1 h-12 rounded-full transition-colors ${
                isResizing
                  ? 'bg-blue-400 shadow-sm shadow-blue-400/50'
                  : 'bg-slate-700/60 group-hover:bg-blue-400 group-hover:h-16'
              }`}
            />
          </div>
        )}
      </aside>
    </>
  )
}
