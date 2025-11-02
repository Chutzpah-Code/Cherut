import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase credentials are configured
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Only initialize Firebase if credentials are provided
if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn(
    '⚠️  Firebase credentials not configured. Please create .env.local file with Firebase config.'
  );
}

export { auth };
export default app;
