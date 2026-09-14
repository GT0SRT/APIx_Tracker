const prisma = require('../lib/prisma');

// Top 15 DGCA Domestic Trunk Routes with Quarterly Passenger Volume Shares (w_r)
const defaultRoutes = [
  { route: 'DEL-BOM', routeCode: 'DEL-BOM', origin: 'DEL', destination: 'BOM', fare: 6820, dgcaWeight: 14.8, passengersMonthly: 512000, monthlyPassengers: 512000, distanceKm: 1148, topCarrier: 'IndiGo', volatility: 'High' },
  { route: 'DEL-BLR', routeCode: 'DEL-BLR', origin: 'DEL', destination: 'BLR', fare: 6410, dgcaWeight: 12.1, passengersMonthly: 418000, monthlyPassengers: 418000, distanceKm: 1740, topCarrier: 'Air India', volatility: 'Moderate' },
  { route: 'BOM-BLR', routeCode: 'BOM-BLR', origin: 'BOM', destination: 'BLR', fare: 4890, dgcaWeight: 11.2, passengersMonthly: 385000, monthlyPassengers: 385000, distanceKm: 842, topCarrier: 'Akasa Air', volatility: 'Low' },
  { route: 'DEL-CCU', routeCode: 'DEL-CCU', origin: 'DEL', destination: 'CCU', fare: 5740, dgcaWeight: 9.0, passengersMonthly: 310000, monthlyPassengers: 310000, distanceKm: 1305, topCarrier: 'IndiGo', volatility: 'Moderate' },
  { route: 'MAA-DEL', routeCode: 'MAA-DEL', origin: 'MAA', destination: 'DEL', fare: 5980, dgcaWeight: 8.5, passengersMonthly: 295000, monthlyPassengers: 295000, distanceKm: 1760, topCarrier: 'Air India', volatility: 'Moderate' },
  { route: 'BLR-HYD', routeCode: 'BLR-HYD', origin: 'BLR', destination: 'HYD', fare: 4620, dgcaWeight: 7.5, passengersMonthly: 260000, monthlyPassengers: 260000, distanceKm: 500, topCarrier: 'IndiGo', volatility: 'Low' },
  { route: 'BOM-GOI', routeCode: 'BOM-GOI', origin: 'BOM', destination: 'GOI', fare: 4450, dgcaWeight: 6.9, passengersMonthly: 240000, monthlyPassengers: 240000, distanceKm: 435, topCarrier: 'IndiGo', volatility: 'High' },
  { route: 'DEL-HYD', routeCode: 'DEL-HYD', origin: 'DEL', destination: 'HYD', fare: 5380, dgcaWeight: 6.8, passengersMonthly: 235000, monthlyPassengers: 235000, distanceKm: 1253, topCarrier: 'Air India', volatility: 'Moderate' },
  { route: 'DEL-PNQ', routeCode: 'DEL-PNQ', origin: 'DEL', destination: 'PNQ', fare: 5120, dgcaWeight: 5.8, passengersMonthly: 210000, monthlyPassengers: 210000, distanceKm: 1173, topCarrier: 'IndiGo', volatility: 'Moderate' },
  { route: 'DEL-AMD', routeCode: 'DEL-AMD', origin: 'DEL', destination: 'AMD', fare: 4650, dgcaWeight: 5.2, passengersMonthly: 195000, monthlyPassengers: 195000, distanceKm: 775, topCarrier: 'IndiGo', volatility: 'Low' },
  { route: 'BOM-MAA', routeCode: 'BOM-MAA', origin: 'BOM', destination: 'MAA', fare: 5420, dgcaWeight: 4.8, passengersMonthly: 180000, monthlyPassengers: 180000, distanceKm: 1033, topCarrier: 'Air India', volatility: 'Moderate' },
  { route: 'DEL-COK', routeCode: 'DEL-COK', origin: 'DEL', destination: 'COK', fare: 6950, dgcaWeight: 4.5, passengersMonthly: 165000, monthlyPassengers: 165000, distanceKm: 2046, topCarrier: 'Air India', volatility: 'High' },
  { route: 'DEL-GAU', routeCode: 'DEL-GAU', origin: 'DEL', destination: 'GAU', fare: 6300, dgcaWeight: 4.1, passengersMonthly: 155000, monthlyPassengers: 155000, distanceKm: 1460, topCarrier: 'IndiGo', volatility: 'Moderate' },
  { route: 'BOM-HYD', routeCode: 'BOM-HYD', origin: 'BOM', destination: 'HYD', fare: 4350, dgcaWeight: 3.8, passengersMonthly: 145000, monthlyPassengers: 145000, distanceKm: 620, topCarrier: 'Akasa Air', volatility: 'Low' },
  { route: 'CCU-BLR', routeCode: 'CCU-BLR', origin: 'CCU', destination: 'BLR', fare: 5880, dgcaWeight: 3.5, passengersMonthly: 135000, monthlyPassengers: 135000, distanceKm: 1560, topCarrier: 'IndiGo', volatility: 'Moderate' },
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
    let routeAvgMap = {};

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

      // Query real scraped average fares per route
      try {
        const routeAverages = await prisma.fareObservation.groupBy({
          by: ['routeId'],
          _avg: { totalFare: true },
          _count: { id: true },
          where: { isOutlier: false },
        });
        routeAverages.forEach((a) => {
          routeAvgMap[a.routeId] = Math.round(a._avg.totalFare || 0);
        });
      } catch (err) {
        console.warn('Could not compute real route averages:', err.message);
      }

      if (routes && routes.length > 0) {
        routes = routes.map((r) => {
          const fallback = defaultRoutes.find((d) => d.routeCode === r.routeCode) || {};
          const rawWeight = Number(r.dgcaWeight || 0.05);
          const weightPct = rawWeight < 1 && rawWeight > 0 ? parseFloat((rawWeight * 100).toFixed(1)) : rawWeight;
          return {
            id: r.id,
            route: r.routeCode,
            routeCode: r.routeCode,
            origin: r.originCode,
            originCode: r.originCode,
            destination: r.destinationCode,
            destinationCode: r.destinationCode,
            fare: routeAvgMap[r.id] || fallback.fare || 6200,
            passengersMonthly: fallback.passengersMonthly || fallback.monthlyPassengers || 250000,
            monthlyPassengers: fallback.passengersMonthly || fallback.monthlyPassengers || 250000,
            dgcaWeight: weightPct,
            topCarrier: fallback.topCarrier || 'IndiGo',
            volatility: fallback.volatility || 'Moderate',
            distanceKm: r.distanceKm || 1100,
            isTrunkRoute: r.isTrunkRoute ?? true,
            isActive: r.isActive ?? true,
          };
        });
      }
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

    const hasLiveObservations = Object.keys(routeAvgMap || {}).length > 0;
    const response = {
      success: true,
      isLive: hasLiveObservations,
      dataSource: hasLiveObservations ? 'live' : 'mock',
      isDemoData: !hasLiveObservations,
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
      isLive: false,
      dataSource: 'mock',
      isDemoData: true,
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
    if (prisma && prisma.fareObservation) {
      const observations = await prisma.fareObservation.findMany({
        where: { isOutlier: false },
        include: { route: true, airline: true },
      });

      if (observations && observations.length > 0) {
        // Group fares by route and carrier
        const routeGroups = {};
        for (const obs of observations) {
          const rCode = obs.route?.routeCode;
          if (!rCode) continue;
          if (!routeGroups[rCode]) routeGroups[rCode] = {};
          const carrier = obs.airline?.name || 'Unknown';
          if (!routeGroups[rCode][carrier]) routeGroups[rCode][carrier] = [];
          routeGroups[rCode][carrier].push(obs.totalFare);
        }

        const avg = (arr) => (arr && arr.length > 0 ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : null);

        const liveParityResults = [];
        for (const [routeCode, carriers] of Object.entries(routeGroups)) {
          const indigoFare = avg(carriers['IndiGo']);
          const airIndiaFare = avg(carriers['Air India'] || carriers['Air India Express']);
          const akasaFare = avg(carriers['Akasa Air']);
          const spiceJetFare = avg(carriers['SpiceJet']);

          const validFares = [indigoFare, airIndiaFare, akasaFare, spiceJetFare].filter(
            (f) => typeof f === 'number' && f > 0
          );

          if (validFares.length >= 2) {
            const minFare = Math.min(...validFares);
            const maxFare = Math.max(...validFares);
            const spreadPercent = parseFloat((((maxFare - minFare) / minFare) * 100).toFixed(1));

            let monopolyRisk = 'Competitive';
            if (spreadPercent >= 35 || validFares.length <= 2) {
              monopolyRisk = 'Monopolistic Warning';
            } else if (spreadPercent >= 15) {
              monopolyRisk = 'Moderate Variance';
            }

            liveParityResults.push({
              route: routeCode,
              indigoFare,
              airIndiaFare,
              akasaFare,
              spiceJetFare,
              minFare,
              maxFare,
              priceSpreadPercent: spreadPercent,
              monopolyRisk,
              flaggedForRegulatoryReview: monopolyRisk === 'Monopolistic Warning',
            });
          }
        }

        if (liveParityResults.length > 0) {
          return res.status(200).json({
            success: true,
            isLive: true,
            dataSource: 'live',
            isDemoData: false,
            timestamp: new Date().toISOString(),
            surveillanceAuthority: 'Competition Commission of India (CCI) & DGCA',
            totalRoutesAudited: liveParityResults.length,
            monopolyWarningsCount: liveParityResults.filter((p) => p.flaggedForRegulatoryReview).length,
            data: { parityAnalysis: liveParityResults },
            parityAnalysis: liveParityResults,
          });
        }
      }
    }

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
      isLive: false,
      dataSource: 'mock',
      isDemoData: true,
      message: 'Demo route parity: Live database contains insufficient cross-carrier quotes',
      timestamp: new Date().toISOString(),
      surveillanceAuthority: 'Competition Commission of India (CCI) & DGCA',
      totalRoutesAudited: parityResults.length,
      monopolyWarningsCount: parityResults.filter((p) => p.flaggedForRegulatoryReview).length,
      data: { parityAnalysis: parityResults },
      parityAnalysis: parityResults,
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
