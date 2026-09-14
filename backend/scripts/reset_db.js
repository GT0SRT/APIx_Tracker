#!/usr/bin/env node
/**
 * APIx Tracker - Database Reset & Pristine Reseed Script
 * Wipes volatile scrape data (FareObservation, DailyRouteIndex, ScraperRunLog)
 * Reseeds master DGCA airports, domestic airlines, 15 core trunk routes,
 * and 30-day MacroDailyIndex inflation baseline.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const prisma = require(path.join(__dirname, '..', 'src', 'lib', 'prisma'));

async function resetAndSeed() {
  console.log('🔄 [APIx Database Reset] Starting pristine database reset...');

  // 1. Wipe volatile scrape tables
  console.log('🧹 Clearing FareObservation, DailyRouteIndex, and ScraperRunLog tables...');
  const obsDel = await prisma.fareObservation.deleteMany({});
  const idxDel = await prisma.dailyRouteIndex.deleteMany({});
  const logDel = await prisma.scraperRunLog.deleteMany({});
  console.log(`   - Deleted ${obsDel.count} FareObservations`);
  console.log(`   - Deleted ${idxDel.count} DailyRouteIndices`);
  console.log(`   - Deleted ${logDel.count} ScraperRunLogs`);

  // 2. Seed DGCA Airports
  console.log('✈️  Seeding 10 DGCA Airports...');
  const airportsData = [
    { iataCode: 'DEL', city: 'Delhi', airportName: 'Indira Gandhi International Airport', state: 'Delhi' },
    { iataCode: 'BOM', city: 'Mumbai', airportName: 'Chhatrapati Shivaji Maharaj International Airport', state: 'Maharashtra' },
    { iataCode: 'BLR', city: 'Bengaluru', airportName: 'Kempegowda International Airport', state: 'Karnataka' },
    { iataCode: 'HYD', city: 'Hyderabad', airportName: 'Rajiv Gandhi International Airport', state: 'Telangana' },
    { iataCode: 'CCU', city: 'Kolkata', airportName: 'Netaji Subhash Chandra Bose International Airport', state: 'West Bengal' },
    { iataCode: 'MAA', city: 'Chennai', airportName: 'Chennai International Airport', state: 'Tamil Nadu' },
    { iataCode: 'GOI', city: 'Goa', airportName: 'Dabolim / Manohar International Airport', state: 'Goa' },
    { iataCode: 'PNQ', city: 'Pune', airportName: 'Pune International Airport', state: 'Maharashtra' },
    { iataCode: 'PAT', city: 'Patna', airportName: 'Jay Prakash Narayan Airport', state: 'Bihar' },
    { iataCode: 'GAU', city: 'Guwahati', airportName: 'Lokpriya Gopinath Bordoloi Airport', state: 'Assam' },
  ];

  for (const apt of airportsData) {
    await prisma.airport.upsert({
      where: { iataCode: apt.iataCode },
      update: apt,
      create: apt,
    });
  }

  // 3. Seed Domestic Airlines
  console.log('🏢 Seeding Major Indian Domestic Airlines...');
  const airlinesData = [
    { code: '6E', name: 'IndiGo', brandColor: '#002868', isActive: true },
    { code: 'AI', name: 'Air India', brandColor: '#ED1C24', isActive: true },
    { code: 'QP', name: 'Akasa Air', brandColor: '#FF6B00', isActive: true },
    { code: 'IX', name: 'Air India Express', brandColor: '#E31E24', isActive: true },
    { code: 'SG', name: 'SpiceJet', brandColor: '#ED1B24', isActive: true },
  ];

  for (const al of airlinesData) {
    await prisma.airline.upsert({
      where: { code: al.code },
      update: al,
      create: al,
    });
  }

  // 4. Seed Official 15 DGCA Trunk Routes
  console.log('🗺️  Seeding Official Top 15 DGCA City-Pair Trunk Routes...');
  const routesData = [
    { originCode: 'DEL', destinationCode: 'BOM', routeCode: 'DEL-BOM', dgcaWeight: 0.142, distanceKm: 1148 },
    { originCode: 'DEL', destinationCode: 'BLR', routeCode: 'DEL-BLR', dgcaWeight: 0.118, distanceKm: 1740 },
    { originCode: 'BOM', destinationCode: 'BLR', routeCode: 'BOM-BLR', dgcaWeight: 0.096, distanceKm: 842 },
    { originCode: 'MAA', destinationCode: 'DEL', routeCode: 'MAA-DEL', dgcaWeight: 0.084, distanceKm: 1760 },
    { originCode: 'DEL', destinationCode: 'CCU', routeCode: 'DEL-CCU', dgcaWeight: 0.078, distanceKm: 1305 },
    { originCode: 'BLR', destinationCode: 'HYD', routeCode: 'BLR-HYD', dgcaWeight: 0.071, distanceKm: 500 },
    { originCode: 'DEL', destinationCode: 'HYD', routeCode: 'DEL-HYD', dgcaWeight: 0.068, distanceKm: 1253 },
    { originCode: 'BOM', destinationCode: 'GOI', routeCode: 'BOM-GOI', dgcaWeight: 0.062, distanceKm: 435 },
    { originCode: 'DEL', destinationCode: 'MAA', routeCode: 'DEL-MAA', dgcaWeight: 0.059, distanceKm: 1760 },
    { originCode: 'BOM', destinationCode: 'MAA', routeCode: 'BOM-MAA', dgcaWeight: 0.054, distanceKm: 1033 },
    { originCode: 'CCU', destinationCode: 'BLR', routeCode: 'CCU-BLR', dgcaWeight: 0.048, distanceKm: 1560 },
    { originCode: 'DEL', destinationCode: 'PNQ', routeCode: 'DEL-PNQ', dgcaWeight: 0.042, distanceKm: 1173 },
    { originCode: 'DEL', destinationCode: 'PAT', routeCode: 'DEL-PAT', dgcaWeight: 0.038, distanceKm: 850 },
    { originCode: 'BOM', destinationCode: 'PAT', routeCode: 'BOM-PAT', dgcaWeight: 0.022, distanceKm: 1450 },
    { originCode: 'BLR', destinationCode: 'CCU', routeCode: 'BLR-CCU', dgcaWeight: 0.018, distanceKm: 1560 },
  ];

  for (const r of routesData) {
    await prisma.route.upsert({
      where: { routeCode: r.routeCode },
      update: {
        dgcaWeight: r.dgcaWeight,
        distanceKm: r.distanceKm,
      },
      create: r,
    });
  }

  // 5. Seed 30-Day MacroDailyIndex Time Series
  console.log('📈 Seeding 30-Day MacroDailyIndex Historical Time-Series (Base 2024=100)...');
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);

    const baseFactor = 134.0 + (30 - i) * 0.28 + Math.sin(i / 3) * 1.1;
    const headline = parseFloat(baseFactor.toFixed(1));
    const baseline = parseFloat((131.0 + (30 - i) * 0.12).toFixed(1));

    await prisma.macroDailyIndex.upsert({
      where: { date: d },
      update: {
        compositeIndex: headline,
        baselineIndex: baseline,
      },
      create: {
        date: d,
        compositeIndex: headline,
        baselineIndex: baseline,
        volatilityRating: headline > 140 ? 'High' : 'Moderate',
        totalDataPoints: 45000 + (30 - i) * 1200,
        momInflation: 2.4,
        yoyInflation: 8.7,
      },
    });
  }

  console.log('✅ [APIx Database Reset] Reset and re-seed completed successfully!');
  console.log('📊 Current DB Summary:');
  const counts = {
    airports: await prisma.airport.count(),
    airlines: await prisma.airline.count(),
    routes: await prisma.route.count(),
    macroIndices: await prisma.macroDailyIndex.count(),
    observations: await prisma.fareObservation.count(),
    dailyIndices: await prisma.dailyRouteIndex.count(),
    scraperLogs: await prisma.scraperRunLog.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
}

resetAndSeed()
  .catch((err) => {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
