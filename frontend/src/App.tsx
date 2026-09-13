import { useState } from 'react'
import type { TabType } from './types/apix'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { OverviewView } from './components/views/OverviewView'
import { IndexSeriesView } from './components/views/IndexSeriesView'
import { RoutesHorizonsView } from './components/views/RoutesHorizonsView'
import { AiHubView } from './components/views/AiHubView'
import { IngestionAuditView } from './components/views/IngestionAuditView'
import { MethodologyView } from './components/views/MethodologyView'
import { OneClickReportModal } from './components/reports/OneClickReportModal'
import { agenticAnomalyAlerts } from './data/agenticData'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [aiSubTab, setAiSubTab] = useState<'ml' | 'agent' | 'rag'>('ml')
  const [range, setRange] = useState('Daily')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const navigateToAi = (subTab: 'ml' | 'agent' | 'rag') => {
    setAiSubTab(subTab)
    setActiveTab('ai-intelligence')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
          if (tab === 'ai-intelligence') setAiSubTab('ml')
        }}
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
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setSidebarOpen={setSidebarOpen}
          range={range}
          setRange={setRange}
          onOpenReportModal={() => setShowReportModal(true)}
          onNavigateToAi={navigateToAi}
          anomalyCount={agenticAnomalyAlerts.length}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'overview' && (
          <OverviewView
            onNavigateToAi={navigateToAi}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'index-series' && <IndexSeriesView />}

        {activeTab === 'routes-horizons' && <RoutesHorizonsView />}

        {(activeTab === 'ai-intelligence' || activeTab === 'ml-forecasting' || activeTab === 'agentic-ai') && (
          <AiHubView key={aiSubTab} initialSubTab={aiSubTab} />
        )}

        {activeTab === 'audit-logs' && <IngestionAuditView />}

        {activeTab === 'methodology' && <MethodologyView />}
      </main>

      {/* One-Click Executive Report Modal */}
      {showReportModal && (
        <OneClickReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  )
}
