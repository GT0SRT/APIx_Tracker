import {
  PanelLeft,
  HelpCircle,
  Lock,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TabType } from '../../types/apix'
import { navItems } from '../../data/navigation'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  activeTab: TabType
  setSidebarOpen: (open: boolean) => void
}

export function Header({
  activeTab,
  setSidebarOpen,
}: HeaderProps) {
  const navigate = useNavigate()
  const { isAuthenticated, logout, openLoginModal } = useAuth()

  const currentTabMeta =
    navItems.find((item) => item.id === activeTab) || navItems[0]

  return (
    <header
      className="
        sticky top-0 z-30
        flex min-h-20 items-center justify-between
        border-b border-white/[0.07]
        bg-[#0B1220]/95
        px-4 md:px-8
        backdrop-blur-xl
        shadow-[0_8px_30px_rgba(0,0,0,0.12)]
      "
    >
      {/* =====================================================
          LEFT — PAGE TITLE
          ===================================================== */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile sidebar */}
        <button
          className="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-xl
            border border-white/[0.08]
            bg-white/[0.035]
            text-[#8EA4B5]
            transition-all duration-200
            hover:border-[#20D6C7]/25
            hover:bg-[#20D6C7]/[0.08]
            hover:text-[#5EE7DF]
            active:scale-95
            cursor-pointer
            lg:hidden
          "
          onClick={() => setSidebarOpen(true)}
          aria-label="Toggle navigation panel"
          title="Open navigation panel"
        >
          <PanelLeft className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="
                truncate
                text-base sm:text-lg md:text-xl
                font-bold tracking-tight
                text-white
              "
            >
              {activeTab === 'overview'
                ? 'Airfare Price Index (APIx) Dashboard'
                : currentTabMeta.label}
            </h1>

            {currentTabMeta.badge && (
              <span
                className="
                  hidden sm:inline-flex
                  items-center
                  rounded-md
                  border border-[#20D6C7]/20
                  bg-[#20D6C7]/[0.08]
                  px-2 py-0.5
                  text-[9px]
                  font-bold uppercase tracking-wide
                  text-[#5EE7DF]
                "
              >
                {currentTabMeta.badge}
              </span>
            )}
          </div>

          <p
            className="
              hidden sm:block
              mt-0.5
              truncate
              text-xs
              text-[#71899B]
            "
          >
            {currentTabMeta.desc}
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT — STATUS + ACTIONS
          ===================================================== */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        {/* -------------------------------------------------
            LIVE PIPELINE
            ------------------------------------------------- */}
        <div
          className="
            hidden sm:flex
            items-center gap-2
            rounded-xl
            border border-[#20D6C7]/15
            bg-[#20D6C7]/[0.055]
            px-3 py-1.5
            text-xs font-semibold
            text-[#7CE9E0]
            shadow-[inset_0_0_18px_rgba(32,214,199,0.025)]
          "
        >
          <span className="relative flex h-2 w-2">
            <span
              className="
                absolute
                inline-flex h-full w-full
                animate-ping
                rounded-full
                bg-[#20D6C7]
                opacity-50
              "
            />

            <span
              className="
                relative
                inline-flex h-2 w-2
                rounded-full
                bg-[#20D6C7]
                shadow-[0_0_9px_rgba(32,214,199,0.8)]
              "
            />
          </span>

          <span>Pipeline Active</span>
        </div>

        {/* -------------------------------------------------
            HELP
            ------------------------------------------------- */}
        <button
          onClick={() => navigate('/help-support')}
          title="Help & Support / MoSPI Documentation"
          aria-label="Help and Support"
          className="
            group
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            border border-white/[0.08]
            bg-white/[0.035]
            text-[#8197A8]
            transition-all duration-200
            hover:border-[#20D6C7]/25
            hover:bg-[#20D6C7]/[0.07]
            hover:text-[#5EE7DF]
            hover:shadow-[0_0_18px_rgba(32,214,199,0.08)]
            active:scale-95
            cursor-pointer
          "
        >
          <HelpCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        </button>

        {/* -------------------------------------------------
            AUTHENTICATED ADMIN
            ------------------------------------------------- */}
        {isAuthenticated ? (
          <div
            className="
              flex items-center gap-2
              border-l border-white/[0.08]
              pl-1 sm:pl-2
            "
          >
            {/* Admin status */}
            <span
              className="
                hidden md:inline-flex
                items-center gap-1.5
                rounded-xl
                border border-[#20D6C7]/15
                bg-[#20D6C7]/[0.055]
                px-2.5 py-1
                text-[11px]
                font-bold
                text-[#73E7DF]
              "
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#20D6C7]" />
              Admin
              <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#20D6C7] shadow-[0_0_7px_rgba(32,214,199,0.8)]" />
            </span>

            {/* Logout */}
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="
                group
                flex items-center gap-1.5
                rounded-xl
                border border-[#FF6B6B]/15
                bg-[#FF6B6B]/[0.045]
                px-3 py-1.5
                text-xs font-bold
                text-[#FF8A8A]
                transition-all duration-200
                hover:border-[#FF6B6B]/30
                hover:bg-[#FF6B6B]/10
                hover:text-[#FFAAAA]
                active:scale-[0.98]
                cursor-pointer
              "
              title="End admin session"
            >
              <LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          /* -------------------------------------------------
             ADMIN LOGIN
             ------------------------------------------------- */
          <div
            className="
              flex items-center
              border-l border-white/[0.08]
              pl-1 sm:pl-2
            "
          >
            <button
              onClick={openLoginModal}
              className="
                group
                relative
                flex items-center gap-1.5
                overflow-hidden
                rounded-xl
                border border-[#20D6C7]/20
                bg-[#20D6C7]
                px-3.5 py-1.5
                text-xs font-bold
                text-[#07151A]
                shadow-[0_0_18px_rgba(32,214,199,0.12)]
                transition-all duration-200
                hover:bg-[#5EE7DF]
                hover:shadow-[0_0_24px_rgba(32,214,199,0.20)]
                active:scale-[0.98]
                cursor-pointer
              "
              title="Authenticate with Admin credentials"
            >
              <Lock className="h-3.5 w-3.5" />

              <span>Admin Login</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}