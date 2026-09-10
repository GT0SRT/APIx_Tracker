const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting APIx Tracker Database Seed...');

  // 1. Seed Airports
  console.log('✈️  Seeding DGCA Airports...');
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
      update: {},
      create: apt,
    });
  }

  // 2. Seed Airlines
  console.log('🏢 Seeding Domestic Airlines...');
  const airlinesData = [
    { code: '6E', name: 'IndiGo', brandColor: '#0052CC', isActive: true },
    { code: 'AI', name: 'Air India', brandColor: '#D90429', isActive: true },
    { code: 'QP', name: 'Akasa Air', brandColor: '#FF6700', isActive: true },
    { code: 'SG', name: 'SpiceJet', brandColor: '#FF0000', isActive: true },
  ];

  for (const al of airlinesData) {
    await prisma.airline.upsert({
      where: { code: al.code },
      update: {},
      create: al,
    });
  }

  // 3. Seed Top 15 DGCA Trunk Routes & Traffic Weights (w_r)
  console.log('🗺️  Seeding Official DGCA City-Pair Routes & Weights...');
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

  const createdRoutes = {};
  for (const r of routesData) {
    const route = await prisma.route.upsert({
      where: { routeCode: r.routeCode },
      update: { dgcaWeight: r.dgcaWeight },
      create: r,
    });
    createdRoutes[r.routeCode] = route;
  }

  // 4. Seed MacroDailyIndex (30-day historical time-series)
  console.log('📈 Seeding MacroDailyIndex Series...');
  const baseDate = new Date('2024-08-01');
  const macroTrend = [
    { dayOffset: 3, index: 135.4, baseline: 132.2 },
    { dayOffset: 5, index: 136.8, baseline: 132.5 },
    { dayOffset: 7, index: 137.1, baseline: 132.8 },
    { dayOffset: 9, index: 139.5, baseline: 133.1 },
    { dayOffset: 11, index: 138.7, baseline: 133.3 },
    { dayOffset: 13, index: 140.8, baseline: 133.6 },
    { dayOffset: 15, index: 139.9, baseline: 134.1 },
    { dayOffset: 17, index: 141.2, baseline: 134.4 },
    { dayOffset: 19, index: 142.5, baseline: 134.8 },
  ];

  for (const t of macroTrend) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + t.dayOffset);

    await prisma.macroDailyIndex.upsert({
      where: { date },
      update: { compositeIndex: t.index, baselineIndex: t.baseline },
      create: {
        date,
        compositeIndex: t.index,
        baselineIndex: t.baseline,
        volatilityRating: 'High',
        totalDataPoints: 145200,
        momInflation: 2.4,
        yoyInflation: 8.7,
      },
    });
  }

  // 5. Seed DailyRouteIndex for Lead-Time Elasticity (T+1 to T+45)
  console.log('⏱️  Seeding Lead-Time Elasticity Horizons (T+1 to T+45)...');
  const delBomRoute = createdRoutes['DEL-BOM'];
  if (delBomRoute) {
    const elasticityWindows = [
      { window: 'T+1', avgFare: 8450, jevons: 154.2, sampleCount: 48 },
      { window: 'T+7', avgFare: 6820, jevons: 142.5, sampleCount: 52 },
      { window: 'T+15', avgFare: 5940, jevons: 136.1, sampleCount: 50 },
      { window: 'T+30', avgFare: 5480, jevons: 131.4, sampleCount: 46 },
      { window: 'T+45', avgFare: 5320, jevons: 129.8, sampleCount: 44 },
    ];

    const today = new Date('2024-08-20');
    for (const w of elasticityWindows) {
      await prisma.dailyRouteIndex.upsert({
        where: {
          date_routeId_advanceWindow: {
            date: today,
            routeId: delBomRoute.id,
            advanceWindow: w.window,
          },
        },
        update: { avgBaseFare: w.avgFare, jevonsIndexValue: w.jevons },
        create: {
          date: today,
          routeId: delBomRoute.id,
          advanceWindow: w.window,
          jevonsIndexValue: w.jevons,
          sampleCount: w.sampleCount,
          avgBaseFare: w.avgFare,
          minFare: w.avgFare * 0.85,
          maxFare: w.avgFare * 1.35,
        },
      });
    }
  }

  // 6. Seed Sample Fare Observations with SHA-256 Cryptographic Hashes
  console.log('🔒 Seeding Verified Fare Observations (Audit Logs)...');
  const airlines = await prisma.airline.findMany();
  const airlineMap = {};
  airlines.forEach((a) => (airlineMap[a.name] = a.id));

  const sampleScrapes = [
    { route: 'DEL-BOM', airline: 'IndiGo', flightNo: '6E-204', window: 'T+7', base: 5420, fuel: 850, udf: 334, gst: 271 },
    { route: 'DEL-BLR', airline: 'Air India', flightNo: 'AI-506', window: 'T+15', base: 6180, fuel: 920, udf: 376, gst: 309 },
    { route: 'BOM-BLR', airline: 'Akasa Air', flightNo: 'QP-1102', window: 'T+1', base: 8920, fuel: 1100, udf: 462, gst: 446 },
    { route: 'DEL-CCU', airline: 'IndiGo', flightNo: '6E-451', window: 'T+30', base: 4860, fuel: 740, udf: 300, gst: 243 },
    { route: 'DEL-MAA', airline: 'Air India', flightNo: 'AI-440', window: 'T+45', base: 5120, fuel: 800, udf: 316, gst: 256 },
  ];

  for (const s of sampleScrapes) {
    const route = createdRoutes[s.route];
    const airlineId = airlineMap[s.airline] || airlines[0].id;
    const total = s.base + s.fuel + s.udf + s.gst;
    const timestamp = new Date('2024-08-20T06:00:00Z');

    const hashInput = `${s.route}-${s.airline}-${s.flightNo}-${s.window}-${total}-${timestamp.toISOString()}`;
    const sha256Hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    const existing = await prisma.fareObservation.findUnique({
      where: { sha256Hash },
    });

    if (!existing && route) {
      await prisma.fareObservation.create({
        data: {
          timestamp,
          routeId: route.id,
          airlineId,
          flightNumber: s.flightNo,
          departureDate: new Date('2024-08-27'),
          advanceWindow: s.window,
          baseFare: s.base,
          fuelSurcharge: s.fuel,
          airportTaxUDF: s.udf,
          taxGST: s.gst,
          totalFare: total,
          isOutlier: false,
          provenanceStatus: 'CLEANED',
          sha256Hash,
        },
      });
    }
  }

  // 7. Seed ScraperRunLog
  console.log('🤖 Seeding Automated Scraper Run Log...');
  await prisma.scraperRunLog.create({
    data: {
      runStartedAt: new Date(Date.now() - 3600000),
      runFinishedAt: new Date(),
      status: 'SUCCESS',
      totalScraped: 450,
      validRecords: 442,
      outliersFiltered: 8,
      sourcePortal: 'DIRECT_CARRIERS',
      batchSha256: crypto.createHash('sha256').update(`BATCH-${Date.now()}`).digest('hex'),
    },
  });

  console.log('✅ APIx Tracker Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
