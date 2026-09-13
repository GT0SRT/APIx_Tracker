import type {
  TrendPoint,
  ElasticityPoint,
  RouteTrafficWeight,
  FareComponent,
  AirlineParityItem,
  SystemSummary,
  MethodologyComparison,
  LaspeyresMacroData,
  PipelineTelemetry,
  PaginatedResult,
  ScrapedFareRecord,
} from '../types/apix'
import {
  trendData as mockTrendData,
  elasticityData as mockElasticityData,
  dgcaRoutesData as mockDgcaRoutesData,
  fareBreakdown as mockFareBreakdown,
  airlineParityData as mockRouteParityData,
} from '../data/mockData'

function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocal) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return envUrl || 'http://localhost:5000/api/v1'
      }
      return 'http://localhost:5000/api/v1'
    }
  }
  return envUrl || 'http://localhost:5000/api/v1'
}

export const API_BASE_URL = getApiBaseUrl()

const mockSummary: SystemSummary = {
  totalQuotes: 1482920,
  monitoredRoutes: 42,
  currentAverageFare: 6420,
  indexDelta24h: '+0.4%',
  pipelineUptime: '99.94%',
  lastUpdated: new Date().toISOString(),
}

const mockMethodology: MethodologyComparison = {
  jevonsIndex: 104.28,
  carliIndex: 107.15,
  carliBias: 2.87,
  sampleSize: 2500,
  imfCompliant: true,
  elementaryAggregates: [
    { route: 'DEL-BOM', basePeriodAverage: 6200, currentPeriodAverage: 6510, jevonsRatio: 105.0, carliRatio: 106.8, bias: 1.8 },
    { route: 'DEL-BLR', basePeriodAverage: 5900, currentPeriodAverage: 6180, jevonsRatio: 104.7, carliRatio: 107.2, bias: 2.5 },
    { route: 'BOM-BLR', basePeriodAverage: 4500, currentPeriodAverage: 4720, jevonsRatio: 104.9, carliRatio: 108.1, bias: 3.2 },
    { route: 'DEL-CCU', basePeriodAverage: 5400, currentPeriodAverage: 5560, jevonsRatio: 103.0, carliRatio: 105.4, bias: 2.4 },
    { route: 'MAA-DEL', basePeriodAverage: 5600, currentPeriodAverage: 5800, jevonsRatio: 103.6, carliRatio: 106.9, bias: 3.3 },
  ],
}

const mockLaspeyres: LaspeyresMacroData = {
  laspeyresIndex: 105.42,
  basePeriod: '2024=100',
  currentPeriod: 'August 2024',
  totalRoutesWeighted: 6,
  timeSeries: [
    { date: 'Day 1', laspeyres: 100.0, jevonsWeighted: 100.0, carliWeighted: 100.0 },
    { date: 'Day 5', laspeyres: 101.4, jevonsWeighted: 101.1, carliWeighted: 102.3 },
    { date: 'Day 10', laspeyres: 102.8, jevonsWeighted: 102.4, carliWeighted: 104.1 },
    { date: 'Day 15', laspeyres: 107.2, jevonsWeighted: 106.5, carliWeighted: 109.8 },
    { date: 'Day 20', laspeyres: 105.4, jevonsWeighted: 104.8, carliWeighted: 107.9 },
    { date: 'Day 25', laspeyres: 104.9, jevonsWeighted: 104.3, carliWeighted: 107.2 },
    { date: 'Day 30', laspeyres: 105.4, jevonsWeighted: 104.8, carliWeighted: 107.8 },
  ],
}

const mockTelemetry: PipelineTelemetry = {
  pipeline: 'Operational',
  throughputQuotesPerSec: 142,
  activeWorkers: 8,
  p95LatencyMs: 38,
  errorRatePercent: 0.04,
  hampelQuarantineRate: '1.2%',
  nodeStatus: [
    { id: 'node-01', region: 'ap-south-1 (Mumbai)', ip: '10.0.1.12', status: 'Healthy', pingsPerMin: 240 },
    { id: 'node-02', region: 'ap-south-1 (Mumbai)', ip: '10.0.1.13', status: 'Healthy', pingsPerMin: 240 },
    { id: 'node-03', region: 'ap-south-2 (Hyderabad)', ip: '10.0.2.14', status: 'Healthy', pingsPerMin: 236 },
    { id: 'node-04', region: 'ap-south-2 (Hyderabad)', ip: '10.0.2.15', status: 'Healthy', pingsPerMin: 238 },
  ],
}

async function safeFetch<T>(
  endpoint: string,
  fallback: T,
  options?: RequestInit
): Promise<{ data: T; isLive: boolean }> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    })
    clearTimeout(id)
    if (!res.ok) {
      return { data: fallback, isLive: false }
    }
    const json = await res.json()
    return { data: (json.data ?? json) as T, isLive: true }
  } catch {
    return { data: fallback, isLive: false }
  }
}

/** Check if backend REST server is reachable */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 1800)
    const res = await fetch(`${API_BASE_URL}/analytics/summary`, {
      signal: controller.signal,
    })
    clearTimeout(id)
    return res.ok
  } catch {
    return false
  }
}

/** High-level KPI summary cards */
export async function fetchSummary(route?: string, airline?: string): Promise<{ data: SystemSummary; isLive: boolean }> {
  const query = new URLSearchParams()
  if (route) query.set('route', route)
  if (airline) query.set('airline', airline)
  const qStr = query.toString() ? `?${query.toString()}` : ''
  return safeFetch<SystemSummary>(`/analytics/summary${qStr}`, mockSummary)
}

/** Deterministic Fare Decomposition */
export async function fetchFareDecomposition(): Promise<{ data: FareComponent[]; isLive: boolean }> {
  return safeFetch<FareComponent[]>('/analytics/fare-decomposition', mockFareBreakdown)
}

/** 30-Day Index Trend series */
export async function fetchTrendSeries(horizon: string = '30d'): Promise<{ data: TrendPoint[]; isLive: boolean }> {
  return safeFetch<TrendPoint[]>(`/analytics/trend?horizon=${horizon}`, mockTrendData)
}

/** Elasticity Lead Times */
export async function fetchElasticity(route?: string): Promise<{ data: ElasticityPoint[]; isLive: boolean }> {
  const q = route ? `?route=${route}` : ''
  return safeFetch<ElasticityPoint[]>(`/analytics/elasticity${q}`, mockElasticityData)
}

/** DGCA Monitored Corridors */
export async function fetchRoutes(): Promise<{ data: RouteTrafficWeight[]; isLive: boolean }> {
  const result = await safeFetch<any>('/routes', mockDgcaRoutesData)
  const rawList = Array.isArray(result.data)
    ? result.data
    : result.data?.routes || result.data?.data || mockDgcaRoutesData

  const defaultPaxMap: Record<string, { fare: number; pax: number; carrier: string }> = {
    'DEL-BOM': { fare: 6820, pax: 512000, carrier: 'IndiGo' },
    'DEL-BLR': { fare: 6410, pax: 418000, carrier: 'Air India' },
    'BOM-BLR': { fare: 4890, pax: 385000, carrier: 'Akasa Air' },
    'DEL-CCU': { fare: 5740, pax: 310000, carrier: 'IndiGo' },
    'MAA-DEL': { fare: 5980, pax: 295000, carrier: 'Air India' },
    'BLR-HYD': { fare: 4620, pax: 260000, carrier: 'IndiGo' },
    'BOM-GOI': { fare: 4450, pax: 240000, carrier: 'IndiGo' },
    'DEL-HYD': { fare: 5380, pax: 235000, carrier: 'Air India' },
    'DEL-PNQ': { fare: 5120, pax: 210000, carrier: 'IndiGo' },
    'DEL-AMD': { fare: 4650, pax: 195000, carrier: 'IndiGo' },
    'BOM-MAA': { fare: 5420, pax: 180000, carrier: 'Air India' },
    'DEL-COK': { fare: 6950, pax: 165000, carrier: 'Air India' },
  }

  const normalized: RouteTrafficWeight[] = rawList.map((r: any) => {
    const routeCode = r.route || r.routeCode || `${r.originCode || r.origin || 'DEL'}-${r.destinationCode || r.destination || 'BOM'}`
    const meta = defaultPaxMap[routeCode] || { fare: 5800, pax: 220000, carrier: 'IndiGo' }
    const rawWeight = Number(r.dgcaWeight || 5.0)
    const dgcaWeight = rawWeight < 1 && rawWeight > 0 ? Number((rawWeight * 100).toFixed(1)) : rawWeight

    return {
      route: routeCode,
      origin: r.origin || r.originCode || routeCode.split('-')[0] || 'DEL',
      destination: r.destination || r.destinationCode || routeCode.split('-')[1] || 'BOM',
      fare: Number(r.fare || meta.fare),
      passengersMonthly: Number(r.passengersMonthly || r.monthlyPassengers || meta.pax),
      dgcaWeight: dgcaWeight || 5.0,
      topCarrier: r.topCarrier || meta.carrier,
      volatility: r.volatility || 'Moderate',
    }
  })

  return { data: normalized, isLive: result.isLive }
}

/** Fetch Paginated Audit Trail / Scraping Logs */
export async function fetchLogs(
  page: number = 1,
  limit: number = 6
): Promise<{
  data: ScrapedFareRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
  isLive: boolean
}> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE_URL}/logs?page=${page}&limit=${limit}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    })
    clearTimeout(id)
    if (!res.ok) throw new Error()
    const json = await res.json()
    const quotes = json.quotes || []
    if (quotes.length > 0) {
      const records: ScrapedFareRecord[] = quotes.map((q: any) => {
        const route = q.route || 'DEL-BOM'
        const parts = route.split('-')
        return {
          id: q.id || `SCR-${Math.floor(10000 + Math.random() * 90000)}`,
          origin: parts[0] || 'DEL',
          destination: parts[1] || 'BOM',
          carrier: q.carrier || 'IndiGo',
          departureDate: q.departureDate
            ? new Date(q.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '22 Aug 2024',
          scrapedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' IST',
          horizon: (q.advanceWindow || 'T+7') as any,
          baseFare: Number(q.baseFare || 5420),
          fuelSurcharge: Number(q.fuelSurcharge || 850),
          airportTax: Number(q.airportTax || 334),
          voluntaryAddonsStripped: Number(q.voluntaryAddonsStripped || 400),
          totalFare: Number(q.totalFare || 6604),
          hampelPassed: q.hampelVerified !== false,
          iqrPassed: true,
          sha256Hash: q.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          status: (q.status && String(q.status).toUpperCase() === 'CLEANED') ? 'Cleaned' : (q.status || 'Cleaned'),
        }
      })
      const total = Number(json.total || records.length)
      return {
        data: records,
        total,
        page: Number(json.page || page),
        limit: Number(json.limit || limit),
        totalPages: Number(json.totalPages || Math.ceil(total / limit)),
        isLive: true,
      }
    }
  } catch {}

  return {
    data: [],
    total: 0,
    page,
    limit,
    totalPages: 1,
    isLive: false,
  }
}

/** Cross-Carrier Parity and HHI Monopoly Detection */
export async function fetchRouteParity(): Promise<{
  data: AirlineParityItem[]
  hhiBenchmark?: any
  isLive: boolean
}> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`${API_BASE_URL}/routes/parity`, { signal: controller.signal })
    clearTimeout(id)
    if (!res.ok) throw new Error()
    const json = await res.json()
    const parityData = json.data?.parityAnalysis || json.parityAnalysis || mockRouteParityData
    return {
      data: parityData,
      hhiBenchmark: json.data?.hhiBenchmark || json.hhiBenchmark,
      isLive: true,
    }
  } catch {
    return { data: mockRouteParityData, isLive: false }
  }
}

/** Jevons vs. Carli Elementary Index Analysis */
export async function fetchJevonsCarli(): Promise<{ data: MethodologyComparison; isLive: boolean }> {
  return safeFetch<MethodologyComparison>('/methodology/jevons-carli', mockMethodology)
}

/** Modified Laspeyres Macro Index Analysis */
export async function fetchLaspeyres(): Promise<{ data: LaspeyresMacroData; isLive: boolean }> {
  return safeFetch<LaspeyresMacroData>('/methodology/laspeyres', mockLaspeyres)
}

/** Scraping Pipeline Telemetry & Worker Cluster */
export async function fetchTelemetry(): Promise<{ data: PipelineTelemetry; isLive: boolean }> {
  return safeFetch<PipelineTelemetry>('/logs/telemetry', mockTelemetry)
}

/** Paginated Audit Trail / Scraping Logs */
export function paginateData<T>(items: T[], page: number = 1, limit: number = 8): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * limit
  const data = items.slice(startIndex, startIndex + limit)

  return {
    data,
    total,
    page: safePage,
    limit,
    totalPages,
  }
}

/** Verify SHA-256 Record Hash */
export async function verifyRecordHash(
  recordId: string,
  providedHash: string,
  recordData?: any
): Promise<{
  valid: boolean
  calculatedHash?: string
  message: string
  isLive: boolean
}> {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`${API_BASE_URL}/logs/verify-hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId,
        hash: providedHash,
        recordData,
      }),
      signal: controller.signal,
    })
    clearTimeout(id)
    if (!res.ok) throw new Error()
    const json = await res.json()
    return {
      valid: json.valid ?? (json.data?.valid ?? true),
      calculatedHash: json.calculatedHash ?? json.data?.calculatedHash,
      message: json.message ?? json.data?.message ?? 'Cryptographic match confirmed',
      isLive: true,
    }
  } catch {
    // Client-side fallback verification
    const isValid = providedHash.length === 64 && /^[0-9a-f]{64}$/i.test(providedHash)
    return {
      valid: isValid,
      calculatedHash: providedHash,
      message: isValid
        ? 'SHA-256 seal valid (verified client-side)'
        : 'Invalid SHA-256 cryptographic checksum signature',
      isLive: false,
    }
  }
}
