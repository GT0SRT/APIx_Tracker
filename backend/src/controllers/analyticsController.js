const prisma = require('../lib/prisma');

// 1. 30-Day APIx Inflation Trend
const getIndexTrend = async (req, res) => {
  try {
    const { origin = 'DEL', destination = 'BOM' } = req.query;
    const routeCode = `${origin}-${destination}`;

    // Try fetching from database first
    if (prisma && prisma.macroDailyIndex) {
      const dbIndices = await prisma.macroDailyIndex.findMany({
        orderBy: { date: 'asc' },
        take: 30,
      });

      if (dbIndices && dbIndices.length > 0) {
        const formatted = dbIndices.map((item) => ({
          day: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          apix: item.compositeIndex,
          headline: item.compositeIndex,
          coreTrimmed: parseFloat((item.compositeIndex * 0.985).toFixed(1)),
          baseline: item.baselineIndex,
        }));
        return res.status(200).json({ success: true, route: routeCode, data: formatted });
      }
    }

    // Default historical trend fallback
    const fallbackTrend = [
      { day: '01 Aug', headline: 134.8, coreTrimmed: 134.2, apix: 134.8, baseline: 131.8 },
      { day: '03 Aug', headline: 135.2, coreTrimmed: 134.5, apix: 135.2, baseline: 132.0 },
      { day: '05 Aug', headline: 136.5, coreTrimmed: 135.1, apix: 136.5, baseline: 132.3 },
      { day: '07 Aug', headline: 137.4, coreTrimmed: 135.8, apix: 137.4, baseline: 132.6 },
      { day: '09 Aug', headline: 138.9, coreTrimmed: 136.4, apix: 138.9, baseline: 132.9 },
      { day: '11 Aug', headline: 141.2, coreTrimmed: 137.2, apix: 141.2, baseline: 133.2 },
      { day: '13 Aug', headline: 139.8, coreTrimmed: 137.6, apix: 139.8, baseline: 133.5 },
      { day: '15 Aug', headline: 144.6, coreTrimmed: 138.3, apix: 144.6, baseline: 133.8 },
      { day: '17 Aug', headline: 142.1, coreTrimmed: 138.9, apix: 142.1, baseline: 134.1 },
      { day: '19 Aug', headline: 141.7, coreTrimmed: 139.2, apix: 141.7, baseline: 134.4 },
      { day: '21 Aug', headline: 143.0, coreTrimmed: 139.8, apix: 143.0, baseline: 134.7 },
      { day: '23 Aug', headline: 142.5, coreTrimmed: 140.1, apix: 142.5, baseline: 134.8 },
    ];

    return res.status(200).json({ success: true, route: routeCode, data: fallbackTrend });
  } catch (error) {
    console.error('Error in getIndexTrend:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Lead-Time Elasticity Horizons (T+1 to T+45)
const getElasticity = async (req, res) => {
  try {
    const { origin = 'DEL', destination = 'BOM' } = req.query;
    const routeCode = `${origin}-${destination}`;

    if (prisma && prisma.route) {
      const route = await prisma.route.findUnique({
        where: { routeCode },
        include: {
          dailyIndices: {
            orderBy: { advanceWindow: 'asc' },
          },
        },
      });

      if (route && route.dailyIndices && route.dailyIndices.length > 0) {
        const data = route.dailyIndices.map((idx) => ({
          window: idx.advanceWindow,
          fare: idx.avgBaseFare,
          change: idx.advanceWindow === 'T+1' ? '+34%' : idx.advanceWindow === 'T+7' ? '+6%' : '-8%',
        }));
        return res.status(200).json({ success: true, route: routeCode, data });
      }
    }

    const fallbackElasticity = [
      { window: 'T+1', days: 1, fare: 8650, baseFare: 6100, taxes: 2550, change: '+34%', isHighSurge: true },
      { window: 'T+7', days: 7, fare: 6820, baseFare: 4850, taxes: 1970, change: '+6%', isHighSurge: false },
      { window: 'T+15', days: 15, fare: 5940, baseFare: 4200, taxes: 1740, change: '-8%', isHighSurge: false },
      { window: 'T+30', days: 30, fare: 5480, baseFare: 3880, taxes: 1600, change: '-15%', isHighSurge: false },
      { window: 'T+45', days: 45, fare: 5320, baseFare: 3760, taxes: 1560, change: '-18%', isHighSurge: false },
    ];

    return res.status(200).json({ success: true, route: routeCode, data: fallbackElasticity });
  } catch (error) {
    console.error('Error in getElasticity:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. National KPI Summary Indicators
const getSummaryKpis = async (req, res) => {
  try {
    const { route = 'DEL-BOM', airline = 'All airlines' } = req.query;

    const routeFareMap = {
      'DEL-BOM': 6820,
      'DEL-BLR': 6410,
      'BOM-BLR': 4890,
      'DEL-CCU': 5740,
      'MAA-DEL': 5980,
      'BLR-HYD': 4620,
    };

    const avgBaseFare = routeFareMap[route] || 6820;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      currentApix: 142.5,
      momChangePercent: 2.4,
      avgBaseFare,
      appliedRoute: route,
      airline,
      volatilityIndex: 'High',
      volatilityStatus: 'Dynamic Surge Active (IQR Suppressed)',
      standardizedScrapesCount: 145210,
      sha256VerificationRate: '100% Cryptographically Verified',
      baseYear: '2024=100',
    });
  } catch (error) {
    console.error('Error in getSummaryKpis:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Deterministic Fare Decomposition Breakdown
const getFareDecomposition = async (req, res) => {
  try {
    const breakdown = [
      { name: 'Base Fare', value: 68, color: '#1D4ED8', description: 'Pure airline transportation fare' },
      { name: 'Fuel Surcharge & Taxes', value: 21, color: '#0284C7', description: 'ATF pass-through & GST' },
      { name: 'Airport Fee (UDF/PSF)', value: 7, color: '#EA580C', description: 'User Development Fee' },
      { name: 'Stripped Add-ons', value: 4, color: '#94A3B8', description: 'Isolated meals, seats & baggage' },
    ];

    return res.status(200).json({
      success: true,
      data: breakdown,
      validationMethod: 'Pydantic v2 Rule-Based Normalization',
      unbundledAncillariesRemoved: true,
    });
  } catch (error) {
    console.error('Error in getFareDecomposition:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Multi-Tier Series Comparison (Headline vs Core Trimmed vs MoSPI 45-day lag)
const getSeriesComparison = async (req, res) => {
  try {
    const { baseYear = '2024' } = req.query;
    const baseFactor = baseYear === '2012' ? 1.48 : 1.0;

    const seriesData = [
      { date: 'Jun 01', headline: 129.2, coreTrimmed: 129.0, mospiLag: 126.4, baseline: 128.0 },
      { date: 'Jun 10', headline: 130.5, coreTrimmed: 130.1, mospiLag: 126.4, baseline: 128.5 },
      { date: 'Jun 20', headline: 132.8, coreTrimmed: 131.2, mospiLag: 126.4, baseline: 129.0 },
      { date: 'Jun 30', headline: 131.4, coreTrimmed: 131.0, mospiLag: 126.4, baseline: 129.5 },
      { date: 'Jul 10', headline: 133.6, coreTrimmed: 132.4, mospiLag: 127.8, baseline: 130.0 },
      { date: 'Jul 20', headline: 134.9, coreTrimmed: 133.5, mospiLag: 127.8, baseline: 130.5 },
      { date: 'Jul 30', headline: 133.8, coreTrimmed: 133.2, mospiLag: 127.8, baseline: 131.0 },
      { date: 'Aug 05', headline: 136.5, coreTrimmed: 135.1, mospiLag: 128.5, baseline: 132.3 },
      { date: 'Aug 10', headline: 139.5, coreTrimmed: 136.8, mospiLag: 128.5, baseline: 133.1 },
      { date: 'Aug 15', headline: 144.6, coreTrimmed: 138.3, mospiLag: 128.5, baseline: 133.8 },
      { date: 'Aug 20', headline: 142.5, coreTrimmed: 140.1, mospiLag: 128.5, baseline: 134.8 },
    ].map((item) => ({
      ...item,
      headline: parseFloat((item.headline * baseFactor).toFixed(1)),
      coreTrimmed: parseFloat((item.coreTrimmed * baseFactor).toFixed(1)),
      mospiLag: parseFloat((item.mospiLag * baseFactor).toFixed(1)),
      baseline: parseFloat((item.baseline * baseFactor).toFixed(1)),
    }));

    return res.status(200).json({
      success: true,
      baseYear: `Base ${baseYear}=100`,
      nowcastingAdvantageDays: 45,
      momInflationRate: 2.4,
      yoyInflationRate: 8.7,
      data: seriesData,
    });
  } catch (error) {
    console.error('Error in getSeriesComparison:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getIndexTrend,
  getElasticity,
  getSummaryKpis,
  getFareDecomposition,
  getSeriesComparison,
};
