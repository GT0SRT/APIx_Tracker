import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  fetchSummary,
  fetchFareDecomposition,
  fetchTrendSeries,
  fetchRoutes,
  fetchLogs,
  fetchElasticity,
  fetchTelemetry,
  fetchRouteParity,
  fetchJevonsCarli,
  fetchLaspeyres,
} from '../services/api'
import type {
  SystemSummary,
  FareComponent,
  TrendPoint,
  RouteTrafficWeight,
  ElasticityPoint,
  PipelineTelemetry,
  AirlineParityItem,
  MethodologyComparison,
  LaspeyresMacroData,
} from '../types/apix'

/** 1. High-Level Summary Card KPIs */
export function useSummaryQuery(route?: string, airline?: string) {
  return useQuery<{ data: SystemSummary; isLive: boolean }>({
    queryKey: ['summary', route || 'ALL', airline || 'ALL'],
    queryFn: () => fetchSummary(route, airline),
    staleTime: 45 * 1000,
  })
}

/** 2. Fare Decomposition Breakdown */
export function useFareDecompositionQuery() {
  return useQuery<{ data: FareComponent[]; isLive: boolean }>({
    queryKey: ['fareDecomposition'],
    queryFn: () => fetchFareDecomposition(),
    staleTime: 5 * 60 * 1000,
  })
}

/** 3. 30-Day Index Trend Series */
export function useTrendSeriesQuery(horizon: string = '30d') {
  return useQuery<{ data: TrendPoint[]; isLive: boolean }>({
    queryKey: ['trendSeries', horizon],
    queryFn: () => fetchTrendSeries(horizon),
    staleTime: 60 * 1000,
  })
}

/** 4. DGCA Monitored Corridors */
export function useRoutesQuery() {
  return useQuery<{ data: RouteTrafficWeight[]; isLive: boolean }>({
    queryKey: ['routes'],
    queryFn: () => fetchRoutes(),
    staleTime: 10 * 60 * 1000,
  })
}

/** 5. Paginated Scrape Observations & Audit Logs (with keepPreviousData for zero-flash pagination) */
export function useLogsQuery(page: number = 1, limit: number = 6) {
  return useQuery({
    queryKey: ['logs', page, limit],
    queryFn: () => fetchLogs(page, limit),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

/** 6. Lead-Time Elasticity Horizons (T+1 to T+45) */
export function useElasticityQuery(route?: string) {
  return useQuery<{ data: ElasticityPoint[]; isLive: boolean }>({
    queryKey: ['elasticity', route || 'DEL-BOM'],
    queryFn: () => fetchElasticity(route),
    staleTime: 60 * 1000,
  })
}

/** 7. Scraping Pipeline Telemetry & Cluster Status */
export function useTelemetryQuery(enablePolling: boolean = false) {
  return useQuery<{ data: PipelineTelemetry; isLive: boolean }>({
    queryKey: ['telemetry'],
    queryFn: () => fetchTelemetry(),
    staleTime: 15 * 1000,
    refetchInterval: enablePolling ? 30 * 1000 : false,
  })
}

/** 8. Route Competition & Parity */
export function useRouteParityQuery() {
  return useQuery<{ data: AirlineParityItem[]; isLive: boolean; hhiBenchmark?: any }>({
    queryKey: ['routeParity'],
    queryFn: () => fetchRouteParity(),
    staleTime: 2 * 60 * 1000,
  })
}

/** 9. Jevons vs Carli Methodology */
export function useJevonsCarliQuery() {
  return useQuery<{ data: MethodologyComparison; isLive: boolean }>({
    queryKey: ['methodology', 'jevons-carli'],
    queryFn: () => fetchJevonsCarli(),
    staleTime: 10 * 60 * 1000,
  })
}

/** 10. Modified Laspeyres Macro Index */
export function useLaspeyresQuery() {
  return useQuery<{ data: LaspeyresMacroData; isLive: boolean }>({
    queryKey: ['methodology', 'laspeyres'],
    queryFn: () => fetchLaspeyres(),
    staleTime: 10 * 60 * 1000,
  })
}
