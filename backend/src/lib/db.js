const crypto = require('crypto');

/**
 * Computes Jevons Elementary Geometric Mean Index
 * Formula: I_J(t/0) = exp( (1/n) * \sum ln(P_i(t) / P_i(0)) )
 * Recommended by IMF CPI Manual (2020) for airfares.
 *
 * @param {Array<{ currentPrice: number, basePrice: number }>} pricePairs
 * @returns {number} Geometric index value (e.g. 142.5)
 */
function computeJevonsIndex(pricePairs) {
  if (!pricePairs || pricePairs.length === 0) return 100.0;

  const validPairs = pricePairs.filter(
    (p) => p.currentPrice > 0 && p.basePrice > 0
  );

  if (validPairs.length === 0) return 100.0;

  const logSum = validPairs.reduce((acc, pair) => {
    return acc + Math.log(pair.currentPrice / pair.basePrice);
  }, 0);

  const geometricMeanRelative = Math.exp(logSum / validPairs.length);
  return Number((geometricMeanRelative * 100).toFixed(2));
}

/**
 * Computes National Macro APIx Composite Index
 * Formula: Macro APIx = \sum w_r * I_r(t/0)
 * Weighted by official DGCA quarterly passenger traffic volume shares (w_r).
 *
 * @param {Array<{ jevonsIndex: number, dgcaWeight: number }>} routeIndices
 * @returns {number} National composite index value
 */
function computeMacroAPIx(routeIndices) {
  if (!routeIndices || routeIndices.length === 0) return 100.0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const item of routeIndices) {
    if (item.jevonsIndex > 0 && item.dgcaWeight > 0) {
      weightedSum += item.jevonsIndex * item.dgcaWeight;
      totalWeight += item.dgcaWeight;
    }
  }

  if (totalWeight === 0) return 100.0;
  return Number((weightedSum / totalWeight).toFixed(2));
}

/**
 * Generates an immutable SHA-256 cryptographic provenance hash for a flight observation.
 *
 * @param {Object} observation
 * @returns {string} SHA-256 hex digest
 */
function generateSha256Hash(observation) {
  const { route, carrier, flightNo, departureDate, advanceWindow, totalFare, timestamp } = observation;
  const payload = `${route}|${carrier}|${flightNo}|${departureDate}|${advanceWindow}|${totalFare}|${timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

module.exports = {
  computeJevonsIndex,
  computeMacroAPIx,
  generateSha256Hash,
};
