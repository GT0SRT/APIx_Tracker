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
