#!/usr/bin/env node
/**
 * APIx Tracker - Timestamp-Aware Selective Purge Script
 * Safely removes pre-scraper fake rows from Neon DB while preserving
 * all real scraper-ingested data (FareObservation, DailyRouteIndex, ScraperRunLog).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const prisma = require(path.join(__dirname, '..', 'src', 'lib', 'prisma'));

async function purgeSeedData(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes('--dry-run');
  console.log(`🧹 [Purge Script] Starting timestamp-aware selective purge (${isDryRun ? 'DRY RUN' : 'LIVE EXECUTION'})...`);

  // 1. Find earliest real scraper run
  const earliestRealRun = await prisma.scraperRunLog.findFirst({
    where: {
      sourcePortal: { in: ['GOOGLE_FLIGHTS', 'EASEMYTRIP'] },
      validRecords: { gt: 0 },
    },
    orderBy: { runStartedAt: 'asc' },
  });

  if (!earliestRealRun) {
    console.warn('⚠️  No real scraper runs found in ScraperRunLog! Aborting purge to avoid accidental data loss.');
    return;
  }

  const tMin = earliestRealRun.runStartedAt;
  console.log(`⏱️  Earliest Real Scraper Run ID: ${earliestRealRun.id} at ${tMin.toISOString()}`);
  console.log(`   Source Portal: ${earliestRealRun.sourcePortal}, Valid Records: ${earliestRealRun.validRecords}`);

  // 2. Count rows before and after tMin
  const [
    obsBefore, obsAfter,
    dailyBefore, dailyAfter,
    macroBefore, macroAfter,
    logsBefore, logsAfter,
  ] = await Promise.all([
    prisma.fareObservation.count({ where: { timestamp: { lt: tMin } } }),
    prisma.fareObservation.count({ where: { timestamp: { gte: tMin } } }),
    prisma.dailyRouteIndex.count({ where: { createdAt: { lt: tMin } } }),
    prisma.dailyRouteIndex.count({ where: { createdAt: { gte: tMin } } }),
    prisma.macroDailyIndex.count({ where: { createdAt: { lt: tMin } } }),
    prisma.macroDailyIndex.count({ where: { createdAt: { gte: tMin } } }),
    prisma.scraperRunLog.count({ where: { runStartedAt: { lt: tMin } } }),
    prisma.scraperRunLog.count({ where: { runStartedAt: { gte: tMin } } }),
  ]);

  console.log('\n📊 Audit Breakdown:');
  console.log(`   - FareObservation:  ${obsBefore} pre-run seed rows | ${obsAfter} live scraped rows to PRESERVE`);
  console.log(`   - DailyRouteIndex:  ${dailyBefore} pre-run seed rows | ${dailyAfter} live computed rows to PRESERVE`);
  console.log(`   - MacroDailyIndex:  ${macroBefore} pre-run seed rows | ${macroAfter} live computed rows to PRESERVE`);
  console.log(`   - ScraperRunLog:    ${logsBefore} pre-run mock logs | ${logsAfter} live run logs to PRESERVE`);

  if (isDryRun) {
    console.log('\n[DRY RUN] No database rows were deleted. Run without --dry-run to execute.');
    return;
  }

  // 3. Perform selective deletions
  console.log('\n🗑️  Executing selective deletion of pre-run fake seed data...');

  const deletedObs = await prisma.fareObservation.deleteMany({
    where: { timestamp: { lt: tMin } },
  });
  console.log(`   ✔ Deleted ${deletedObs.count} pre-run FareObservation records`);

  const deletedDaily = await prisma.dailyRouteIndex.deleteMany({
    where: { createdAt: { lt: tMin } },
  });
  console.log(`   ✔ Deleted ${deletedDaily.count} pre-run DailyRouteIndex records`);

  const deletedMacro = await prisma.macroDailyIndex.deleteMany({
    where: { createdAt: { lt: tMin } },
  });
  console.log(`   ✔ Deleted ${deletedMacro.count} pre-run MacroDailyIndex records`);

  const deletedLogs = await prisma.scraperRunLog.deleteMany({
    where: { runStartedAt: { lt: tMin } },
  });
  console.log(`   ✔ Deleted ${deletedLogs.count} pre-run ScraperRunLog records`);

  // 4. Verify post-purge database status
  const [finalObs, finalDaily, finalMacro, finalLogs] = await Promise.all([
    prisma.fareObservation.count(),
    prisma.dailyRouteIndex.count(),
    prisma.macroDailyIndex.count(),
    prisma.scraperRunLog.count(),
  ]);

  console.log('\n✅ Selective Purge Completed Successfully:');
  console.log(`   - Remaining FareObservations:  ${finalObs} (All genuine scraped data)`);
  console.log(`   - Remaining DailyRouteIndices: ${finalDaily} (All genuine scraped data)`);
  console.log(`   - Remaining MacroDailyIndices: ${finalMacro}`);
  console.log(`   - Remaining ScraperRunLogs:    ${finalLogs} (All genuine runs)`);
}

if (require.main === module) {
  purgeSeedData()
    .catch((err) => {
      console.error('❌ Purge failed with error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { purgeSeedData };
