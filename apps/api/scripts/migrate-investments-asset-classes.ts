import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Migrates pre-Block-6 `finance_investments` docs (old flat `type` field,
// contribution-ledger model) to the asset-class model: assetClass/assetType,
// liquidity, acquiredValue/acquiredDate, currentValue/valuedDate.
// Idempotent — skips docs that already have `assetClass`. Run manually
// against the emulator during dev, then once against real data. Never
// auto-run on deploy.

dotenv.config();

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(__dirname, '../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      console.log('🔑 Using service account file...');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('🔑 Using environment variables...');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      throw new Error(
        'Firebase credentials not found. Please provide either:\n' +
        '1. service-account.json file in api directory\n' +
        '2. Environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL',
      );
    }
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

const OLD_TYPE_TO_ASSET: Record<string, { assetClass: string; assetType: string }> = {
  stock: { assetClass: 'financial', assetType: 'Stocks' },
  crypto: { assetClass: 'financial', assetType: 'Cryptocurrency' },
  fund: { assetClass: 'financial', assetType: 'Investment fund' },
  real_estate: { assetClass: 'realEstate', assetType: 'Residential property' },
  other: { assetClass: 'financial', assetType: 'Investment fund' },
};

async function migrateInvestmentsAssetClasses() {
  console.log('🚀 Starting investments → asset-class migration...');

  const snapshot = await db.collection('finance_investments').get();
  console.log(`📊 Found ${snapshot.docs.length} investments to check`);

  let updated = 0;
  let skipped = 0;
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const data = doc.data() as any;

    if (data.assetClass) {
      console.log(`⏭️  Skipping "${data.name}" (${doc.id}) — already migrated`);
      skipped++;
      continue;
    }

    const mapping = OLD_TYPE_TO_ASSET[data.type] ?? OLD_TYPE_TO_ASSET.other;
    const totalContributed = data.totalContributed ?? 0;
    const acquiredDate = (data.createdAt ?? new Date().toISOString()).slice(0, 10);
    const valuedDate = (data.updatedAt ?? data.createdAt ?? new Date().toISOString()).slice(0, 10);

    batch.update(doc.ref, {
      assetClass: mapping.assetClass,
      assetType: mapping.assetType,
      liquidity: 'liquid',
      currentValue: totalContributed,
      valuedDate,
      acquiredValue: totalContributed,
      acquiredDate,
      linkedAccountId: data.accountId ?? null,
      updatedAt: new Date().toISOString(),
    });

    console.log(`🔄 Migrating "${data.name}" (${doc.id}) → ${mapping.assetClass} / ${mapping.assetType}`);
    updated++;
  }

  if (updated > 0) {
    console.log(`💾 Committing batch update for ${updated} investments...`);
    await batch.commit();
    console.log('✅ Batch update completed successfully!');
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   Updated: ${updated} investments`);
  console.log(`   Skipped: ${skipped} investments (already migrated)`);
}

migrateInvestmentsAssetClasses()
  .then(() => {
    console.log('🏁 Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
