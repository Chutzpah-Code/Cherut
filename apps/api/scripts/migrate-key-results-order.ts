import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try service account file first
    const serviceAccountPath = path.join(__dirname, '../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      console.log('🔑 Using service account file...');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    // Try environment variables (production setup)
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('🔑 Using environment variables...');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    else {
      throw new Error(
        'Firebase credentials not found. Please provide either:\n' +
        '1. service-account.json file in api directory\n' +
        '2. Environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL'
      );
    }

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function migrateKeyResultsOrder() {
  console.log('🚀 Starting Key Results order field migration...');

  try {
    // Get all key results that don't have an order field
    const keyResultsSnapshot = await db
      .collection('keyResults')
      .get();

    console.log(`📊 Found ${keyResultsSnapshot.docs.length} key results to check`);

    let updated = 0;
    let skipped = 0;
    const batch = db.batch();

    for (const doc of keyResultsSnapshot.docs) {
      const data = doc.data();

      // Check if order field is missing or null
      if (data.order === undefined || data.order === null) {
        // Group by objectiveId to maintain order within each objective
        const objectiveId = data.objectiveId;

        // Get existing key results for this objective to determine the order
        const existingKRs = await db
          .collection('keyResults')
          .where('objectiveId', '==', objectiveId)
          .orderBy('createdAt', 'asc')
          .get();

        // Find the index of this document in the ordered list
        const index = existingKRs.docs.findIndex(d => d.id === doc.id);
        const order = index >= 0 ? index : 0;

        // Update with order field
        batch.update(doc.ref, {
          order: order,
          updatedAt: new Date().toISOString()
        });

        console.log(`🔢 Setting order ${order} for Key Result "${data.title}" (${doc.id})`);
        updated++;
      } else {
        console.log(`⏭️  Skipping Key Result "${data.title}" (already has order: ${data.order})`);
        skipped++;
      }
    }

    if (updated > 0) {
      console.log(`💾 Committing batch update for ${updated} key results...`);
      await batch.commit();
      console.log('✅ Batch update completed successfully!');
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Updated: ${updated} key results`);
    console.log(`   Skipped: ${skipped} key results`);
    console.log(`   Total processed: ${updated + skipped} key results`);

    if (updated > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('📝 You can now restore the orderBy("order") queries in the code.');
    } else {
      console.log('\n✨ All key results already have order fields. No migration needed.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateKeyResultsOrder()
  .then(() => {
    console.log('🏁 Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });