export type TabType =
  | 'overview'
  | 'index-series'
  | 'routes-horizons'
  | 'ai-intelligence'
  | 'audit-logs'
  | 'methodology'
  | 'ml-forecasting'
  | 'agentic-ai'

export interface TrendPoint {
  day: string
  headlineApix: number
  coreTrimmedApix: number
  baseline: number
  mospiOfficial?: number
}

export interface ElasticityPoint {
  window: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45'
  days: number
  fare: number
  change: string
  isHighSurge: boolean
  baseFare: number
  taxes: number
  surgeFactor: number
}

export interface RouteTrafficWeight {
  route: string
  origin: string
  destination: string
  fare: number
  passengersMonthly: number
  dgcaWeight: number // percentage
  topCarrier: string
  volatility: 'Low' | 'Moderate' | 'High'
}

export interface FareComponent {
  name: string
  value: number
  color: string
  description: string
}

export interface ScrapedFareRecord {
  id: string
  origin: string
  destination: string
  carrier: string
  departureDate: string
  scrapedTimestamp: string
  horizon: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45'
  baseFare: number
  fuelSurcharge: number
  airportTax: number
  voluntaryAddonsStripped: number
  totalFare: number
  hampelPassed: boolean
  iqrPassed: boolean
  sha256Hash: string
  status: 'Cleaned' | 'Outlier Suppressed' | 'Validated'
}

export interface AnomalyAlert {
  id: string
  timestamp: string
  route: string
  carrier: string
  horizon: string
  severity: 'Critical' | 'Warning' | 'Info'
  title: string
  description: string
  deviationPercent: string
  rootCause: string
  actionTaken: string
  agentConfidence: number
  regulatoryFlag: boolean
}

export interface ForecastPoint {
  horizon: string
  daysAhead: number
  predictedFare: number
  lowerBound: number
  upperBound: number
  surgeRisk: 'Normal' | 'Elevated' | 'High Surge'
  historicalAvg: number
}

export interface RagDocCitation {
  id: string
  title: string
  organization: 'MoSPI' | 'DGCA' | 'IMF' | 'Eurostat' | 'UK ONS'
  reference: string
  excerpt: string
  relevanceScore: number
}

export interface RagQaItem {
  id: string
  question: string
  category: 'Methodology' | 'Compliance' | 'Ancillary Rules' | 'Traffic Weighting'
  answer: string
  citations: RagDocCitation[]
}

export interface AirlineParityItem {
  route: string
  indigoFare: number
  airIndiaFare: number
  akasaFare: number
  priceSpreadPercent: number
  monopolyRisk: 'Competitive' | 'Moderate Variance' | 'Monopolistic Warning'
}

export interface SystemSummary {
  totalQuotes: number
  monitoredRoutes: number
  currentAverageFare: number
  indexDelta24h: string
  pipelineUptime: string
  lastUpdated: string
  currentApix?: number
  momChangePercent?: number
  volatilityIndex?: string
  volatilityStatus?: string
  standardizedScrapesCount?: number
  avgBaseFare?: number
  appliedRoute?: string
}

export interface MethodologyComparison {
  jevonsIndex: number
  carliIndex: number
  carliBias: number
  sampleSize: number
  imfCompliant: boolean
  elementaryAggregates: Array<{
    route: string
    basePeriodAverage: number
    currentPeriodAverage: number
    jevonsRatio: number
    carliRatio: number
    bias: number
  }>
}

export interface LaspeyresMacroData {
  laspeyresIndex: number
  basePeriod: string
  currentPeriod: string
  totalRoutesWeighted: number
  timeSeries: Array<{
    date: string
    laspeyres: number
    jevonsWeighted: number
    carliWeighted: number
  }>
}

export interface PipelineTelemetry {
  pipeline?: string
  throughputQuotesPerSec?: number
  activeWorkers?: number
  p95LatencyMs?: number
  errorRatePercent?: number
  hampelQuarantineRate?: string
  residentialProxyPool?: string
  domSchemaStatus?: string
  outliersFilteredToday?: number
  averageLatencyMs?: number
  database?: string
  nodeStatus?: Array<{
    id: string
    region: string
    ip: string
    status: string
    pingsPerMin: number
  }>
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
