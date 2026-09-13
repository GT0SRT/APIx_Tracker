const prisma = require('../lib/prisma');

// Top 15 DGCA Domestic Trunk Routes with Quarterly Passenger Volume Shares (w_r)
const defaultRoutes = [
  { routeCode: 'DEL-BOM', origin: 'DEL', destination: 'BOM', dgcaWeight: 0.148, monthlyPassengers: 512000, distanceKm: 1148, topCarrier: 'IndiGo', volatility: 'High' },
  { routeCode: 'DEL-BLR', origin: 'DEL', destination: 'BLR', dgcaWeight: 0.121, monthlyPassengers: 418000, distanceKm: 1740, topCarrier: 'Air India', volatility: 'Moderate' },
  { routeCode: 'BOM-BLR', origin: 'BOM', destination: 'BLR', dgcaWeight: 0.112, monthlyPassengers: 385000, distanceKm: 842, topCarrier: 'Akasa Air', volatility: 'Low' },
  { routeCode: 'DEL-CCU', origin: 'DEL', destination: 'CCU', dgcaWeight: 0.090, monthlyPassengers: 310000, distanceKm: 1305, topCarrier: 'IndiGo', volatility: 'Moderate' },
  { routeCode: 'MAA-DEL', origin: 'MAA', destination: 'DEL', dgcaWeight: 0.085, monthlyPassengers: 295000, distanceKm: 1760, topCarrier: 'Air India', volatility: 'Moderate' },
  { routeCode: 'BLR-HYD', origin: 'BLR', destination: 'HYD', dgcaWeight: 0.075, monthlyPassengers: 260000, distanceKm: 500, topCarrier: 'IndiGo', volatility: 'Low' },
  { routeCode: 'BOM-GOI', origin: 'BOM', destination: 'GOI', dgcaWeight: 0.069, monthlyPassengers: 240000, distanceKm: 435, topCarrier: 'IndiGo', volatility: 'High' },
  { routeCode: 'DEL-HYD', origin: 'DEL', destination: 'HYD', dgcaWeight: 0.068, monthlyPassengers: 235000, distanceKm: 1253, topCarrier: 'Air India', volatility: 'Moderate' },
];

// Cross-Airline Pricing Observations for Market Competition Surveillance
const parityObservations = [
  { route: 'DEL-BOM', indigoFare: 6820, airIndiaFare: 7150, akasaFare: 6450, spiceJetFare: 7400 },
  { route: 'DEL-BLR', indigoFare: 6410, airIndiaFare: 6380, akasaFare: 6120, spiceJetFare: 6600 },
  { route: 'BOM-BLR', indigoFare: 4890, airIndiaFare: 5200, akasaFare: 4650, spiceJetFare: 5100 },
  { route: 'DEL-CCU', indigoFare: 5740, airIndiaFare: 6200, akasaFare: 5490, spiceJetFare: 6300 },
  { route: 'MAA-DEL', indigoFare: 5980, airIndiaFare: 6100, akasaFare: 5620, spiceJetFare: 6400 },
  { route: 'BLR-HYD', indigoFare: 4620, airIndiaFare: 4950, akasaFare: 4400, spiceJetFare: 4800 },
  { route: 'DEL-IXL', indigoFare: 14200, airIndiaFare: 19800, akasaFare: null, spiceJetFare: null }, // Monopolistic duopoly
];

/**
 * GET /api/v1/routes
 * List all active DGCA city-pair routes and weights
 */
const getRoutes = async (req, res) => {
  try {
    if (prisma && prisma.route) {
      const routes = await prisma.route.findMany({
        where: { isActive: true },
        orderBy: { dgcaWeight: 'desc' },
      });
      if (routes && routes.length > 0) {
        return res.status(200).json({ success: true, count: routes.length, data: routes });
      }
    }
    return res.status(200).json({ success: true, count: defaultRoutes.length, data: defaultRoutes });
  } catch (error) {
    console.warn('Fallback to default routes:', error.message);
    return res.status(200).json({ success: true, count: defaultRoutes.length, data: defaultRoutes });
  }
};

/**
 * GET /api/v1/routes/parity
 * Calculates cross-airline pricing parity, spread percentage, and monopoly risk flags (Slide 5: CCI/DGCA)
 */
const getRouteParity = async (req, res) => {
  try {
    const parityResults = parityObservations.map((item) => {
      const validFares = [item.indigoFare, item.airIndiaFare, item.akasaFare, item.spiceJetFare].filter(
        (f) => typeof f === 'number' && f > 0
      );

      const minFare = Math.min(...validFares);
      const maxFare = Math.max(...validFares);
      const spreadPercent = parseFloat((((maxFare - minFare) / minFare) * 100).toFixed(1));

      let monopolyRisk = 'Competitive';
      if (spreadPercent >= 35 || validFares.length <= 2) {
        monopolyRisk = 'Monopolistic Warning';
      } else if (spreadPercent >= 15) {
        monopolyRisk = 'Moderate Variance';
      }

      return {
        route: item.route,
        indigoFare: item.indigoFare,
        airIndiaFare: item.airIndiaFare,
        akasaFare: item.akasaFare,
        spiceJetFare: item.spiceJetFare,
        minFare,
        maxFare,
        priceSpreadPercent: spreadPercent,
        monopolyRisk,
        flaggedForRegulatoryReview: monopolyRisk === 'Monopolistic Warning',
      };
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      surveillanceAuthority: 'Competition Commission of India (CCI) & DGCA',
      totalRoutesAudited: parityResults.length,
      monopolyWarningsCount: parityResults.filter((p) => p.flaggedForRegulatoryReview).length,
      data: parityResults,
    });
  } catch (error) {
    console.error('Error in getRouteParity:', error.message);
    return res.status(500).json({ error: 'Internal server error calculating parity' });
  }
};

module.exports = {
  getRoutes,
  getRouteParity,
};
