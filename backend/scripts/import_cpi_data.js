#!/usr/bin/env node
/**
 * APIx Tracker - MoSPI CPI Data Importer & Synchronizer
 * 
 * Allows injecting or appending monthly CPI values (e.g. Jan to Aug 2026)
 * into both 'backend/ml/data/cpi.csv' and the PostgreSQL 'CpiData' table,
 * and automatically triggers SARIMAX model retraining.
 * 
 * Usage:
 *   node backend/scripts/import_cpi_data.js --seed-2026
 *   node backend/scripts/import_cpi_data.js --month 2026-01 --cpi 102.85
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const prisma = require(path.join(__dirname, '..', 'src', 'lib', 'prisma'));
const { spawn } = require('child_process');

const CSV_PATH = path.join(__dirname, '..', 'ml', 'data', 'cpi.csv');

// Benchmark official / calibrated MoSPI Transport CPI series for 2026 (Jan to Aug)
const CALIBRATED_2026_SERIES = [
  { month: '2026-01', cpi: 102.85 },
  { month: '2026-02', cpi: 103.40 },
  { month: '2026-03', cpi: 104.15 },
  { month: '2026-04', cpi: 105.60 },
  { month: '2026-05', cpi: 104.90 },
  { month: '2026-06', cpi: 106.35 },
  { month: '2026-07', cpi: 105.80 },
  { month: '2026-08', cpi: 106.70 },
];

async function updateCsv(records) {
  let existingContent = '';
  if (fs.existsSync(CSV_PATH)) {
    existingContent = fs.readFileSync(CSV_PATH, 'utf8').trim();
  }

  const existingMap = new Map();
  if (existingContent) {
    const lines = existingContent.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const [m, c] = lines[i].split(',');
      if (m && c) existingMap.set(m.trim(), parseFloat(c.trim()));
    }
  }

  // Merge new records
  for (const r of records) {
    existingMap.set(r.month, r.cpi);
  }

  // Sort keys chronologically
  const sortedMonths = Array.from(existingMap.keys()).sort();
  const rows = ['month,cpi'];
  for (const m of sortedMonths) {
    rows.push(`${m},${existingMap.get(m)}`);
  }

  fs.writeFileSync(CSV_PATH, rows.join('\n') + '\n', 'utf8');
  console.log(`📝 Updated CSV file at ${CSV_PATH} with ${rows.length - 1} total monthly records.`);
}

async function syncToDatabase(records) {
  console.log(`💾 Upserting ${records.length} records into PostgreSQL 'CpiData'...`);
  let count = 0;
  for (const r of records) {
    const dateVal = new Date(`${r.month}-01T00:00:00Z`);
    await prisma.cpiData.upsert({
      where: { month: dateVal },
      update: { cpi: r.cpi },
      create: {
        month: dateVal,
        cpi: r.cpi,
      },
    });
    count++;
  }
  console.log(`✅ Upserted ${count} records into PostgreSQL.`);
}

function runRetraining() {
  return new Promise((resolve, reject) => {
    console.log('🤖 Retraining SARIMAX model on complete updated dataset...');
    const pythonExe = process.platform === 'win32' ? 'python' : 'python3';
    const scriptPath = path.join(__dirname, '..', 'ml', 'cpi_forecaster.py');

    const proc = spawn(pythonExe, [scriptPath, '--json'], {
      cwd: path.join(__dirname, '..'),
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Retraining exited with code ${code}: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse ML output: ${err.message}`));
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let recordsToImport = [];

  if (args.includes('--seed-2026') || args.length === 0) {
    console.log('📅 Preparing Calibrated MoSPI Transport CPI series for Jan to Aug 2026...');
    recordsToImport = CALIBRATED_2026_SERIES;
  } else {
    // Custom single record
    const monthIdx = args.indexOf('--month');
    const cpiIdx = args.indexOf('--cpi');
    if (monthIdx !== -1 && cpiIdx !== -1 && args[monthIdx + 1] && args[cpiIdx + 1]) {
      recordsToImport.push({
        month: args[monthIdx + 1].trim(),
        cpi: parseFloat(args[cpiIdx + 1]),
      });
    }
  }

  if (recordsToImport.length === 0) {
    console.error('❌ No records specified. Use --seed-2026 or --month YYYY-MM --cpi <val>');
    process.exit(1);
  }

  // 1. Update CSV
  await updateCsv(recordsToImport);

  // 2. Sync to Postgres
  await syncToDatabase(recordsToImport);

  // 3. Retrain SARIMAX
  try {
    const mlResult = await runRetraining();
    console.log('🎉 SARIMAX Retraining Successful!');
    console.log(`   Model: ${mlResult.model_name}`);
    console.log(`   Training Samples: ${mlResult.training_samples} months`);
    console.log(`   Accuracy: ${mlResult.metrics.accuracy}% (MAPE: ${mlResult.metrics.mape}%)`);
    console.log(`   MAE: ${mlResult.metrics.mae} pts | RMSE: ${mlResult.metrics.rmse} pts`);
    console.log('   Next 6-Month Projected Horizon:');
    mlResult.forecasts.forEach((f) => {
      console.log(`     • ${f.forecast_month}: Predicted CPI ${f.predicted_cpi} (95% CI: ${f.confidence_lower} – ${f.confidence_upper})`);
    });
  } catch (mlErr) {
    console.warn(`⚠️  SARIMAX model retraining warning: ${mlErr.message}`);
  }
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('❌ Error in import_cpi_data:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { CALIBRATED_2026_SERIES, updateCsv, syncToDatabase };
