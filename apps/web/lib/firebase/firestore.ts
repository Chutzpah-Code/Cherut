import { getFirestore, Firestore } from 'firebase/firestore';
import app from './config';

let db: Firestore | null = null;

// Initialize Firestore only if Firebase app is configured
if (app) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.error('Firestore initialization error:', error);
  }
}

export { db };
