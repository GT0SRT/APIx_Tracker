import {
  Plane,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  ShieldCheck,
  LogIn,
  Sparkles,
} from 'lucide-react'
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
}

export function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}: SidebarProps) {
  const { isAuthenticated, user, openLoginModal } = useAuth()

  const visibleNavItems = isAuthenticated
    ? navItems
    : navItems.filter(
        (item) => item.id === 'overview' || item.id === 'help-support'
      )

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          overflow-hidden
          border-r border-white/[0.07]
          bg-[#0B1220]
          text-white
          shadow-[12px_0_40px_rgba(0,0,0,0.12)]
          transition-all duration-300 ease-out

          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}

          ${
            sidebarOpen
              ? 'w-64 translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* =====================================================
            BRAND
            ===================================================== */}
        <div
          className={`
            relative flex h-20 shrink-0 items-center
            border-b border-white/[0.07]
            ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}
          `}
        >
          {/* subtle teal glow */}
          <div className="pointer-events-none absolute -left-8 -top-12 h-28 w-28 rounded-full bg-[#20D6C7]/10 blur-3xl" />

          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="
                group relative flex h-11 w-11 items-center justify-center
                rounded-xl
                border border-[#20D6C7]/20
                bg-[#111B2B]
                text-[#5EE7DF]
                shadow-lg shadow-black/10
                transition-all duration-200
                hover:border-[#20D6C7]/50
                hover:bg-[#162235]
                hover:shadow-[0_0_24px_rgba(32,214,199,0.12)]
              "
              title="Expand sidebar panel"
              aria-label="Expand sidebar panel"
            >
              <PanelLeftOpen className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </button>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-3">
                {/* Logo */}
                <div
                  className="
                    relative flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-[#20D6C7]/25
                    bg-gradient-to-br from-[#20D6C7] to-[#2bc1bc]
                    text-[#07151A]
                    shadow-[0_0_24px_rgba(32,214,199,0.18)]
                  "
                >
                  <Plane className="h-5 w-5 text-white rotate-45" />

                  {/* live dot */}
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0B1220] bg-[#20D6C7]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[15px] font-bold tracking-tight text-white">
                      APIx Tracker
                    </p>
                  </div>

                  <p className="mt-1 truncate text-[9px] font-medium uppercase tracking-[0.16em] text-[#7F9BAE]">
                    Airfare Price Index
                  </p>
                </div>
              </div>

              {/* Mobile close */}
              <button
                className="
                  rounded-lg p-1.5
                  text-slate-500
                  transition
                  hover:bg-white/[0.06]
                  hover:text-white
                  lg:hidden
                "
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Desktop collapse */}
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="
                  hidden rounded-lg p-2
                  text-slate-500
                  transition
                  hover:bg-white/[0.06]
                  hover:text-[#5EE7DF]
                  lg:flex
                "
                title="Collapse sidebar panel"
                aria-label="Collapse sidebar panel"
              >
                <PanelLeftClose className="h-4.5 w-4.5" />
              </button>
            </>
          )}
        </div>

        {/* =====================================================
            NAVIGATION
            ===================================================== */}
        <div className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#61798B]">
                {isAuthenticated ? 'Platform' : 'Public Views'}
              </p>

              {!isAuthenticated && (
                <span
                  className="
                    inline-flex items-center gap-1
                    rounded-md
                    border border-white/[0.07]
                    bg-white/[0.035]
                    px-1.5 py-0.5
                    text-[8px] font-bold uppercase tracking-wide
                    text-[#70879A]
                  "
                >
                  <Lock className="h-2.5 w-2.5" />
                  Restricted
                </span>
              )}
            </div>
          )}

          <nav className="space-y-1">
            {visibleNavItems.map(({ id, label, icon: Icon, badge }) => {
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
                  className={`
                    group relative flex w-full items-center
                    justify-between gap-3
                    rounded-xl
                    px-3 py-2.5
                    text-xs font-semibold
                    transition-all duration-200
                    cursor-pointer

                    ${sidebarCollapsed ? 'justify-center px-2' : ''}

                    ${
                      active
                        ? `
                          border border-[#20D6C7]/15
                          bg-[#20D6C7]/10
                          text-white
                          shadow-[inset_0_0_20px_rgba(32,214,199,0.035)]
                        `
                        : `
                          border border-transparent
                          text-[#9AAFC0]
                          hover:border-white/[0.05]
                          hover:bg-white/[0.045]
                          hover:text-white
                        `
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <span
                      className="
                        absolute left-0 top-1/2
                        h-6 w-[3px]
                        -translate-y-1/2
                        rounded-r-full
                        bg-[#20D6C7]
                        shadow-[0_0_12px_rgba(32,214,199,0.7)]
                      "
                    />
                  )}

                  <div className="flex min-w-0 items-center gap-3">
                    <Icon
                      className={`
                        h-4 w-4 shrink-0
                        transition-all duration-200
                        ${
                          active
                            ? 'text-[#20D6C7]'
                            : isAi
                              ? 'text-[#A78BFA]'
                              : 'text-[#6F8799] group-hover:text-[#B9CBD7]'
                        }
                      `}
                    />

                    {!sidebarCollapsed && (
                      <span className="truncate">{label}</span>
                    )}
                  </div>

                  {!sidebarCollapsed && badge && (
                    <span
                      className={`
                        rounded-md px-1.5 py-0.5
                        text-[8px] font-bold
                        ${
                          active
                            ? 'bg-[#20D6C7]/15 text-[#5EE7DF]'
                            : isAi
                              ? 'border border-[#A78BFA]/20 bg-[#A78BFA]/10 text-[#C4B5FD]'
                              : 'border border-white/[0.07] bg-white/[0.035] text-[#71899B]'
                        }
                      `}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* =====================================================
              AI PROMOTION
              ===================================================== */}
          {isAuthenticated && !sidebarCollapsed && (
            <div
              className="
                relative overflow-hidden
                rounded-xl
                border border-[#A78BFA]/15
                bg-gradient-to-br from-[#A78BFA]/10 via-[#111B2B] to-[#20D6C7]/5
                p-3
              "
            >
              <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-[#A78BFA]/10 blur-2xl" />

              <div className="relative flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A78BFA]/10 text-[#C4B5FD]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#DDD6FE]">
                    APIx Intelligence
                  </p>
                  <p className="text-[9px] text-[#7E829B]">
                    Explore market signals
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              UNAUTHENTICATED NOTICE
              ===================================================== */}
          {!isAuthenticated && !sidebarCollapsed && (
            <div
              className="
                rounded-xl
                border border-[#F4B942]/15
                bg-[#F4B942]/[0.045]
                p-3
              "
            >
              <div className="flex items-center gap-1.5 text-[#F4B942]">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">
                  Admin Access Required
                </span>
              </div>

              <p className="mt-2 text-[9px] leading-relaxed text-[#8496A5]">
                Corridor analysis, price forecasting, ingestion telemetry, and
                formulas are restricted to authorized administrators.
              </p>

              <button
                onClick={() => {
                  setSidebarOpen(false)
                  openLoginModal()
                }}
                className="
                  mt-3 flex w-full items-center justify-center gap-1.5
                  rounded-lg
                  border border-[#F4B942]/20
                  bg-[#F4B942]/10
                  py-1.5
                  text-[10px] font-bold
                  text-[#F7CA69]
                  transition
                  hover:bg-[#F4B942]/15
                "
              >
                <LogIn className="h-3 w-3" />
                Admin Login
              </button>
            </div>
          )}

          {/* Collapsed login */}
          {!isAuthenticated && sidebarCollapsed && (
            <div className="flex justify-center pt-2">
              <button
                onClick={openLoginModal}
                title="Admin Sign In"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-[#F4B942]/20
                  bg-[#F4B942]/[0.07]
                  text-[#F4B942]
                  transition
                  hover:bg-[#F4B942]/15
                "
              >
                <Lock className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =====================================================
              AUTHENTICATED ADMIN
              ===================================================== */}
          {isAuthenticated && !sidebarCollapsed && (
            <div
              className="
                flex items-center gap-2.5
                rounded-xl
                border border-[#20D6C7]/15
                bg-[#20D6C7]/[0.045]
                p-2.5
              "
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#20D6C7]/10 text-[#5EE7DF]">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-[#73E7DF]">
                  Admin Active
                </p>
                <p className="truncate text-[9px] text-[#71899B]">
                  {user?.email}
                </p>
              </div>

              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#20D6C7] shadow-[0_0_8px_rgba(32,214,199,0.7)]" />
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
            ===================================================== */}
        <div
          className="
            shrink-0
            border-t border-white/[0.07]
            bg-[#08101C]
            p-4
          "
        >
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-lg
                  border border-[#20D6C7]/15
                  bg-[#20D6C7]/10
                  text-[10px] font-bold
                  text-[#5EE7DF]
                "
              >
                GOI
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-[#D7E2E9]">
                  MoSPI Analytics
                </p>
                <p className="truncate text-[9px] text-[#607789]">
                  Team AndroMatrix · SIH26056
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg
                  border border-[#20D6C7]/15
                  bg-[#20D6C7]/10
                  text-[10px] font-bold
                  text-[#5EE7DF]
                "
              >
                GOI
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}