const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getIndexTrend = async (req, res) => {
  try {
    const trendData = [
      { day: '04 Aug', apix: 135.4, baseline: 132.2 },
      { day: '06 Aug', apix: 136.8, baseline: 132.5 },
      { day: '08 Aug', apix: 137.1, baseline: 132.8 },
      { day: '10 Aug', apix: 139.5, baseline: 133.1 },
      { day: '12 Aug', apix: 138.7, baseline: 133.3 },
      { day: '14 Aug', apix: 140.8, baseline: 133.6 },
      { day: '16 Aug', apix: 139.9, baseline: 134.1 },
      { day: '18 Aug', apix: 141.2, baseline: 134.4 },
      { day: '20 Aug', apix: 142.5, baseline: 134.8 },
    ];

    return res.status(200).json({ data: trendData });
  } catch (error) {
    console.error('Error in getIndexTrend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getElasticity = async (req, res) => {
  try {
    const elasticityData = [
      { window: 'T+1', fare: 8450, change: '+31%' },
      { window: 'T+7', fare: 6820, change: '+6%' },
      { window: 'T+15', fare: 5940, change: '-8%' },
      { window: 'T+30', fare: 5480, change: '-15%' },
      { window: 'T+45', fare: 5320, change: '-18%' },
    ];

    return res.status(200).json({ data: elasticityData });
  } catch (error) {
    console.error('Error in getElasticity:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getIndexTrend,
  getElasticity,
};
