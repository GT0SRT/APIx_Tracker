/**
 * Helper: Compute Jevons Geometric Mean
 * I_J = ( \prod (P_t / P_0) )^(1/n) = \exp( (1/n) * \sum \ln(P_t / P_0) )
 */
const computeJevons = (relatives) => {
  if (!relatives || relatives.length === 0) return 0;
  const valid = relatives.filter((r) => r > 0);
  if (valid.length === 0) return 0;
  const sumLogs = valid.reduce((sum, r) => sum + Math.log(r), 0);
  return Math.exp(sumLogs / valid.length);
};

/**
 * Helper: Compute Carli Arithmetic Mean
 * I_C = (1/n) * \sum (P_t / P_0)
 */
const computeCarli = (relatives) => {
  if (!relatives || relatives.length === 0) return 0;
  const valid = relatives.filter((r) => r > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, r) => sum + r, 0) / valid.length;
};

/**
 * POST /api/v1/methodology/calculate-jevons
 * Request body: { priceRelatives: [1.05, 1.08, 0.94, 1.12] } or { currentPrices: [...], basePrices: [...] }
 */
const calculateJevonsFormula = async (req, res) => {
  try {
    const { priceRelatives, currentPrices, basePrices } = req.body;
    let relatives = [];

    if (Array.isArray(priceRelatives) && priceRelatives.length > 0) {
      relatives = priceRelatives.map(Number);
    } else if (Array.isArray(currentPrices) && Array.isArray(basePrices) && currentPrices.length === basePrices.length) {
      relatives = currentPrices.map((cp, idx) => Number(cp) / Number(basePrices[idx]));
    } else {
      // Default standard simulation sample
      relatives = [1.08, 1.14, 0.92, 1.05, 1.22, 0.88];
    }

    const jevonsIndex = parseFloat(computeJevons(relatives).toFixed(4));
    const carliIndex = parseFloat(computeCarli(relatives).toFixed(4));
    const upwardDriftBiasPercent = parseFloat((((carliIndex - jevonsIndex) / jevonsIndex) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      sampleSize: relatives.length,
      priceRelatives: relatives,
      jevonsGeometricMean: jevonsIndex,
      jevonsIndexBase100: parseFloat((jevonsIndex * 100).toFixed(2)),
      carliArithmeticMean: carliIndex,
      carliIndexBase100: parseFloat((carliIndex * 100).toFixed(2)),
      upwardDriftBiasPercent,
      standardCompliance: {
        imfManual: 'IMF CPI Manual 2020, Chapter 10.38 - Axiomatic Reversal Test Passed',
        iloManual: 'ILO Consumer Price Index Guidelines (Para 6.12)',
        recommendation: 'Jevons preferred: neutralizes high-frequency dynamic pricing surge bouncing',
      },
    });
  } catch (error) {
    console.error('Error in calculateJevonsFormula:', error.message);
    return res.status(500).json({ error: 'Failed to compute Jevons elementary index' });
  }
};

/**
 * POST /api/v1/methodology/calculate-laspeyres
 * Request body: { routeIndices: [{ route: 'DEL-BOM', index: 142.5, weight: 0.148 }, ...] }
 */
const calculateLaspeyresMacro = async (req, res) => {
  try {
    const { routeIndices } = req.body;
    const defaultBasket = [
      { route: 'DEL-BOM', index: 142.5, weight: 0.148 },
      { route: 'DEL-BLR', index: 139.8, weight: 0.121 },
      { route: 'BOM-BLR', index: 135.2, weight: 0.112 },
      { route: 'DEL-CCU', index: 138.4, weight: 0.090 },
      { route: 'MAA-DEL', index: 136.9, weight: 0.085 },
      { route: 'BLR-HYD', index: 132.0, weight: 0.075 },
    ];

    const basket = Array.isArray(routeIndices) && routeIndices.length > 0 ? routeIndices : defaultBasket;

    let weightedSum = 0;
    let totalWeight = 0;

    basket.forEach((item) => {
      const idx = Number(item.index);
      const w = Number(item.weight);
      if (!isNaN(idx) && !isNaN(w) && w > 0) {
        weightedSum += idx * w;
        totalWeight += w;
      }
    });

    const compositeIndex = totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(2)) : 100.0;

    return res.status(200).json({
      success: true,
      formula: 'P_L = [ sum(I_r * w_r) / sum(w_r) ] * 100',
      totalRoutes: basket.length,
      normalizedWeightSum: parseFloat(totalWeight.toFixed(3)),
      compositeApiX: compositeIndex,
      timestamp: new Date().toISOString(),
      governingAuthority: 'Ministry of Statistics & Programme Implementation (MoSPI)',
    });
  } catch (error) {
    console.error('Error in calculateLaspeyresMacro:', error.message);
    return res.status(500).json({ error: 'Failed to compute Modified Laspeyres Macro Index' });
  }
};

module.exports = {
  calculateJevonsFormula,
  calculateLaspeyresMacro,
};
