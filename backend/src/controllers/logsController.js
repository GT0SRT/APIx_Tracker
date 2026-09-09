const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRecentLogs = async (req, res) => {
  try {
    const feedData = [
      ['DEL', 'BOM', 'IndiGo', '22 Aug 2024', 'T+7', '₹5,420', '₹1,184', '₹6,604'],
      ['BLR', 'DEL', 'Air India', '24 Aug 2024', 'T+15', '₹6,180', '₹1,296', '₹7,476'],
      ['BOM', 'BLR', 'Akasa Air', '21 Aug 2024', 'T+1', '₹8,920', '₹1,562', '₹10,482'],
      ['DEL', 'CCU', 'IndiGo', '25 Aug 2024', 'T+30', '₹4,860', '₹1,040', '₹5,900'],
      ['MAA', 'DEL', 'Air India', '23 Aug 2024', 'T+45', '₹5,120', '₹1,116', '₹6,236'],
    ];

    return res.status(200).json({ data: feedData });
  } catch (error) {
    console.error('Error in getRecentLogs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRecentLogs,
};
