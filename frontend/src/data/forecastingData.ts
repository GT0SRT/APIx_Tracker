import type { ForecastPoint } from '../types/apix'

export const horizonForecastData: ForecastPoint[] = [
  { horizon: 'T+1', daysAhead: 1, predictedFare: 8650, lowerBound: 8200, upperBound: 9100, surgeRisk: 'High Surge', historicalAvg: 8400 },
  { horizon: 'T+3', daysAhead: 3, predictedFare: 7850, lowerBound: 7450, upperBound: 8250, surgeRisk: 'High Surge', historicalAvg: 7700 },
  { horizon: 'T+7', daysAhead: 7, predictedFare: 6820, lowerBound: 6520, upperBound: 7120, surgeRisk: 'Elevated', historicalAvg: 6750 },
  { horizon: 'T+10', daysAhead: 10, predictedFare: 6350, lowerBound: 6100, upperBound: 6600, surgeRisk: 'Normal', historicalAvg: 6300 },
  { horizon: 'T+15', daysAhead: 15, predictedFare: 5940, lowerBound: 5700, upperBound: 6180, surgeRisk: 'Normal', historicalAvg: 5900 },
  { horizon: 'T+21', daysAhead: 21, predictedFare: 5680, lowerBound: 5460, upperBound: 5900, surgeRisk: 'Normal', historicalAvg: 5650 },
  { horizon: 'T+30', daysAhead: 30, predictedFare: 5480, lowerBound: 5280, upperBound: 5680, surgeRisk: 'Normal', historicalAvg: 5450 },
  { horizon: 'T+45', daysAhead: 45, predictedFare: 5320, lowerBound: 5120, upperBound: 5520, surgeRisk: 'Normal', historicalAvg: 5300 },
]

export const modelEvaluationMetrics = {
  modelName: 'Multi-Horizon Temporal Predictive Forecasting Model',
  overallAccuracy: '94.2%',
  meanAbsoluteError: '₹148.20',
  rootMeanSquareError: '₹215.40',
  meanAbsolutePercentageError: '2.84%',
  trainingSampleHorizon: '1.2M historical fare observations across 150+ corridors',
  targetVariable: 'Decomposed Base Airfare (P_i)',
}

export const featureImportance = [
  { feature: 'Aviation Turbine Fuel (ATF) Pass-Through', weight: 38, impact: 'Positive' },
  { feature: 'Lead-Time Booking Velocity (T+1 vs T+30)', weight: 28, impact: 'Exponential' },
  { feature: 'Seasonal Calendar & Long-Weekend Density', weight: 21, impact: 'Surge Factor' },
  { feature: 'Route Seat Capacity & Load Factor (LF)', weight: 13, impact: 'Inverse' },
]

export const forecastMicroTrends = [
  {
    horizon: 'T+1 to T+3',
    signal: 'Bullish (Surge)',
    delta: '+18.4%',
    narrative: 'High dynamic yield algorithm activation on trunk corridors DEL-BOM & DEL-BLR due to corporate last-minute ticketing.',
  },
  {
    horizon: 'T+7 to T+15',
    signal: 'Stabilizing',
    delta: '+2.1%',
    narrative: 'Leisure demand plateauing; IndiGo and Air India maintaining balanced capacity buffers.',
  },
  {
    horizon: 'T+30 to T+45',
    signal: 'Deflationary baseline',
    delta: '-4.6%',
    narrative: 'Early promotional fare tiering active. Ideal matched-basket anchor for MoSPI long-term inflation tracking.',
  },
]
