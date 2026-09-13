import { useState } from 'react'
import type { TabType } from './types/apix'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { OverviewView } from './components/views/OverviewView'
import { IndexSeriesView } from './components/views/IndexSeriesView'
import { RoutesHorizonsView } from './components/views/RoutesHorizonsView'
import { IngestionAuditView } from './components/views/IngestionAuditView'
import { MethodologyView } from './components/views/MethodologyView'
import { MlForecastingModal } from './components/ai/MlForecastingModal'
import { AgenticAiModal } from './components/ai/AgenticAiModal'
import { PolicyRagModal } from './components/ai/PolicyRagModal'
import { OneClickReportModal } from './components/reports/OneClickReportModal'
import { agenticAnomalyAlerts } from './data/agenticData'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [range, setRange] = useState('Daily')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Global AI and Report Modals
  const [activeModal, setActiveModal] = useState<'forecasting' | 'agentic' | 'rag' | 'report' | null>(null)

  const openAiModal = (type: 'forecasting' | 'agentic' | 'rag' | 'report') => {
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        openAiModal={openAiModal}
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
          openAiModal={openAiModal}
          anomalyCount={agenticAnomalyAlerts.length}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'overview' && (
          <OverviewView openAiModal={openAiModal} onNavigateToTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'index-series' && <IndexSeriesView />}

        {activeTab === 'routes-horizons' && <RoutesHorizonsView />}

        {activeTab === 'audit-logs' && <IngestionAuditView />}

        {activeTab === 'methodology' && <MethodologyView />}

        {activeTab === 'ml-forecasting' && <MlForecastingModal isModal={false} />}

        {activeTab === 'agentic-ai' && <AgenticAiModal isModal={false} />}
      </main>

      {/* Global Modals for Quick Header & Sidebar Triggers */}
      {activeModal === 'forecasting' && (
        <MlForecastingModal isModal={true} onClose={closeModal} />
      )}

      {activeModal === 'agentic' && (
        <AgenticAiModal isModal={true} onClose={closeModal} />
      )}

      {activeModal === 'rag' && (
        <PolicyRagModal onClose={closeModal} />
      )}

      {activeModal === 'report' && (
        <OneClickReportModal onClose={closeModal} />
      )}
    </div>
  )
}
