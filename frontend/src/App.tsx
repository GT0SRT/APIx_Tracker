import { useState, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { TabType, ExecutiveReportData } from './types/apix'
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

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportModalData, setReportModalData] = useState<ExecutiveReportData | undefined>(undefined)

  const handleOpenReportModal = (data?: ExecutiveReportData) => {
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
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Executive Header */}
        <Header
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Dynamic Routed Views */}
        <Routes>
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
          <Route path="/index-series" element={<IndexSeriesView />} />
          <Route path="/routes-horizons" element={<RoutesHorizonsView />} />
          <Route path="/routes" element={<Navigate to="/routes-horizons" replace />} />
          <Route
            path="/ai-intelligence"
            element={<AiHubView />}
          />
          <Route path="/ml-forecasting" element={<Navigate to="/ai-intelligence" replace />} />
          <Route path="/ai" element={<Navigate to="/ai-intelligence" replace />} />
          <Route path="/audit-logs" element={<IngestionAuditView />} />
          <Route path="/audit" element={<Navigate to="/audit-logs" replace />} />
          <Route path="/methodology" element={<MethodologyView />} />
          <Route
            path="/help-support"
            element={<HelpSupportView onOpenReportModal={() => handleOpenReportModal()} />}
          />
          <Route path="/help" element={<Navigate to="/help-support" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* One-Click Executive Report Modal */}
      {showReportModal && (
        <ExecutiveReportModal
          onClose={() => setShowReportModal(false)}
          {...reportModalData}
        />
      )}

      {/* Floating AI Statistical Copilot Assistant */}
      <FloatingChatBot />
    </div>
  )
}
