import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { TabType, ExecutiveReportData } from './types/apix'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { OverviewView } from './components/views/OverviewView'
import { IndexSeriesView } from './components/views/IndexSeriesView'
import { RoutesHorizonsView } from './components/views/RoutesHorizonsView'
import { AiHubView } from './components/views/AiHubView'
import { IngestionAuditView } from './components/views/IngestionAuditView'
import { MethodologyView } from './components/views/MethodologyView'
import { HelpSupportView } from './components/views/HelpSupportView'
import { ExecutiveReportModal } from './components/reports/ExecutiveReportModal'
import { FloatingChatBot } from './components/ai/FloatingChatBot'
import { LoginModal } from './components/auth/LoginModal'

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, openLoginModal } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('apix_sidebar_width')
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed >= 200 && parsed <= 450) {
        return parsed
      }
    }
    return 260
  })

  const [isDesktop, setIsDesktop] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  })

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width)
    localStorage.setItem('apix_sidebar_width', String(width))
  }

  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportModalData, setReportModalData] = useState<ExecutiveReportData | undefined>(undefined)

  const handleOpenReportModal = (data?: ExecutiveReportData) => {
    if (!isAuthenticated) {
      openLoginModal()
      return
    }
    setReportModalData(data)
    setShowReportModal(true)
  }

  // Derive active tab from current URL pathname
  const activeTab = useMemo<TabType>(() => {
    const raw = location.pathname.replace(/^\//, '').split('/')[0]
    if (!raw || raw === 'overview') return 'overview'
    if (raw === 'index-series') return 'index-series'
    if (raw === 'routes-horizons' || raw === 'routes') return 'routes-horizons'
    if (raw === 'ai-intelligence' || raw === 'ai' || raw === 'ml-forecasting' || raw === 'agentic-ai') return 'ai-intelligence'
    if (raw === 'audit-logs' || raw === 'audit' || raw === 'ingestion') return 'audit-logs'
    if (raw === 'methodology') return 'methodology'
    if (raw === 'help-support' || raw === 'help') return 'help-support'
    return 'overview'
  }, [location.pathname])

  const handleTabChange = (tab: TabType) => {
    const path = tab === 'overview' ? '/' : `/${tab}`
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={handleSidebarWidthChange}
      />

      {/* Main Content Area */}
      <main
        style={{
          paddingLeft: isDesktop ? (sidebarCollapsed ? '80px' : `${sidebarWidth}px`) : '0px',
        }}
        className="flex-1 flex flex-col min-w-0 transition-[padding] duration-150"
      >
        {/* Sticky Executive Header */}
        <Header
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          onToggleAiCopilot={() => setIsAiCopilotOpen((prev) => !prev)}
          isAiCopilotOpen={isAiCopilotOpen}
        />

        {/* Dynamic Routed Views */}
        <Routes>
          {/* Public Views: Available to all viewers */}
          <Route
            path="/"
            element={
              <OverviewView
                onNavigateToTab={handleTabChange}
                onOpenReportModal={handleOpenReportModal}
              />
            }
          />
          <Route path="/overview" element={<Navigate to="/" replace />} />

          <Route
            path="/help-support"
            element={<HelpSupportView />}
          />
          <Route path="/help" element={<Navigate to="/help-support" replace />} />

          {/* Admin Protected Views: Only rendered when authenticated with valid JWT */}
          {isAuthenticated ? (
            <>
              <Route path="/index-series" element={<IndexSeriesView />} />
              <Route path="/routes-horizons" element={<RoutesHorizonsView />} />
              <Route path="/routes" element={<Navigate to="/routes-horizons" replace />} />
              <Route path="/ai-intelligence" element={<AiHubView />} />
              <Route path="/ml-forecasting" element={<Navigate to="/ai-intelligence" replace />} />
              <Route path="/ai" element={<Navigate to="/ai-intelligence" replace />} />
              <Route path="/audit-logs" element={<IngestionAuditView />} />
              <Route path="/audit" element={<Navigate to="/audit-logs" replace />} />
              <Route path="/methodology" element={<MethodologyView />} />
            </>
          ) : (
            <>
              {/* Unauthenticated viewers accessing direct URLs are strictly redirected to public Overview */}
              <Route path="/index-series" element={<Navigate to="/" replace />} />
              <Route path="/routes-horizons" element={<Navigate to="/" replace />} />
              <Route path="/routes" element={<Navigate to="/" replace />} />
              <Route path="/ai-intelligence" element={<Navigate to="/" replace />} />
              <Route path="/ml-forecasting" element={<Navigate to="/" replace />} />
              <Route path="/ai" element={<Navigate to="/" replace />} />
              <Route path="/audit-logs" element={<Navigate to="/" replace />} />
              <Route path="/audit" element={<Navigate to="/" replace />} />
              <Route path="/methodology" element={<Navigate to="/" replace />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* One-Click Executive Report Modal - Strictly for Logged-In Admins */}
      {showReportModal && isAuthenticated && (
        <ExecutiveReportModal
          onClose={() => setShowReportModal(false)}
          {...reportModalData}
        />
      )}

      {/* Admin Login Dialog Modal */}
      <LoginModal />

      {/* Dockable AI Statistical Copilot Assistant */}
      <FloatingChatBot
        isOpen={isAiCopilotOpen}
        setIsOpen={setIsAiCopilotOpen}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
