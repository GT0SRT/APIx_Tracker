const fs = require('fs');
const path = require('path');
const prisma = require('../src/lib/prisma');

async function seedCpiData() {
  console.log('📊 Seeding MoSPI CPI historical dataset...');
  const csvPath = path.join(__dirname, '..', 'ml', 'data', 'cpi.csv');

  if (!fs.existsSync(csvPath)) {
    console.warn(`[Seed CPI] Warning: CSV not found at ${csvPath}`);
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  const header = lines[0].split(',');
  const monthIdx = header.indexOf('month');
  const cpiIdx = header.indexOf('cpi');

  if (monthIdx === -1 || cpiIdx === -1) {
    console.error('[Seed CPI] CSV missing month or cpi header');
    return;
  }

  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length < 2) continue;
    const monthStr = row[monthIdx].trim();
    const cpiVal = parseFloat(row[cpiIdx]);

    if (monthStr && !isNaN(cpiVal)) {
      const dateVal = new Date(`${monthStr}-01T00:00:00Z`);
      await prisma.cpiData.upsert({
        where: { month: dateVal },
        update: { cpi: cpiVal },
        create: {
          month: dateVal,
          cpi: cpiVal,
        },
      });
      count++;
    }
  }

  console.log(`✅ Successfully seeded ${count} historical CPI records into CpiData.`);
}

if (require.main === module) {
  seedCpiData()
    .catch((err) => {
      console.error('[Seed CPI] Error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedCpiData };
