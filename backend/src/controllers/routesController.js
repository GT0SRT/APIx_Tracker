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
  { routeCode: 'DEL-PNQ', origin: 'DEL', destination: 'PNQ', dgcaWeight: 0.058, monthlyPassengers: 210000, distanceKm: 1173, topCarrier: 'IndiGo', volatility: 'Moderate' },
  { routeCode: 'DEL-AMD', origin: 'DEL', destination: 'AMD', dgcaWeight: 0.052, monthlyPassengers: 195000, distanceKm: 775, topCarrier: 'IndiGo', volatility: 'Low' },
  { routeCode: 'BOM-MAA', origin: 'BOM', destination: 'MAA', dgcaWeight: 0.048, monthlyPassengers: 180000, distanceKm: 1033, topCarrier: 'Air India', volatility: 'Moderate' },
  { routeCode: 'DEL-COK', origin: 'DEL', destination: 'COK', dgcaWeight: 0.045, monthlyPassengers: 165000, distanceKm: 2046, topCarrier: 'Air India', volatility: 'High' },
  { routeCode: 'DEL-GAU', origin: 'DEL', destination: 'GAU', dgcaWeight: 0.041, monthlyPassengers: 155000, distanceKm: 1460, topCarrier: 'IndiGo', volatility: 'Moderate' },
  { routeCode: 'BOM-HYD', origin: 'BOM', destination: 'HYD', dgcaWeight: 0.038, monthlyPassengers: 145000, distanceKm: 620, topCarrier: 'Akasa Air', volatility: 'Low' },
  { routeCode: 'CCU-BLR', origin: 'CCU', destination: 'BLR', dgcaWeight: 0.035, monthlyPassengers: 135000, distanceKm: 1560, topCarrier: 'IndiGo', volatility: 'Moderate' },
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
 * List all active DGCA city-pair routes and weights (with optional pagination)
 */
const getRoutes = async (req, res) => {
  try {
    const page = req.query.page ? Math.max(1, parseInt(req.query.page, 10)) : null;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit, 10))) : null;

    let routes = [];
    let total = 0;

    if (prisma && prisma.route) {
      total = await prisma.route.count({ where: { isActive: true } });
      const queryOptions = {
        where: { isActive: true },
        orderBy: { dgcaWeight: 'desc' },
      };
      if (page && limit) {
        queryOptions.skip = (page - 1) * limit;
        queryOptions.take = limit;
      }
      routes = await prisma.route.findMany(queryOptions);
    }

    if (!routes || routes.length === 0) {
      total = defaultRoutes.length;
      if (page && limit) {
        const skip = (page - 1) * limit;
        routes = defaultRoutes.slice(skip, skip + limit);
      } else {
        routes = defaultRoutes;
      }
    }

    const response = {
      success: true,
      total,
      count: routes.length,
      data: routes,
      routes,
    };

    if (page && limit) {
      response.page = page;
      response.limit = limit;
      response.totalPages = Math.max(1, Math.ceil(total / limit));
    }

    return res.status(200).json(response);
  } catch (error) {
    console.warn('Fallback to default routes:', error.message);
    return res.status(200).json({
      success: true,
      total: defaultRoutes.length,
      count: defaultRoutes.length,
      data: defaultRoutes,
      routes: defaultRoutes,
    });
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
