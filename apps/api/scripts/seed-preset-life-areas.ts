#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/config/firebase.service';
import { LifeAreasService } from '../src/modules/life-areas/life-areas.service';

/**
 * Backfills the 12 preset Life Areas for every existing account.
 * Idempotent — `LifeAreasService.seedDefaults` skips users who already have
 * preset life areas, so this is safe to run more than once.
 *
 * USO:
 * npm run migrate:preset-life-areas
 */
async function seedPresetLifeAreasForExistingUsers() {
  console.log('🚀 Seeding preset life areas for existing users...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const firebaseService = app.get(FirebaseService);
  const lifeAreasService = app.get(LifeAreasService);

  try {
    const db = firebaseService.getFirestore();
    const usersSnapshot = await db.collection('users').get();

    console.log(`📊 Found ${usersSnapshot.docs.length} users`);

    let seeded = 0;
    let skipped = 0;

    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const existing = await db
        .collection('lifeAreas')
        .where('userId', '==', uid)
        .where('isSystemPreset', '==', true)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`⏭️  Skipping ${uid} (already has preset life areas)`);
        skipped++;
        continue;
      }

      await lifeAreasService.seedDefaults(uid);
      console.log(`✅ Seeded preset life areas for ${uid}`);
      seeded++;
    }

    console.log('\n📈 Summary:');
    console.log(`   Seeded: ${seeded} users`);
    console.log(`   Skipped: ${skipped} users`);
    console.log(`   Total processed: ${seeded + skipped} users`);
  } finally {
    await app.close();
  }
}

seedPresetLifeAreasForExistingUsers()
  .then(() => {
    console.log('🏁 Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
