import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
let db: any = null;

// Check if we should use emulator (development mode)
const shouldUseEmulator = () => {
  return process.env.NODE_ENV === 'development' && typeof window !== 'undefined';
};

// Initialize Firebase for emulator or production
if (shouldUseEmulator()) {
  // 🧪 EMULATOR MODE
  console.log('🧪 Initializing Firebase for EMULATOR mode');

  try {
    // Use demo project ID for emulator (must match backend)
    const emulatorConfig = {
      apiKey: 'demo-key',
      authDomain: 'demo-project.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'demo-app-id'
    };

    app = getApps().length === 0 ? initializeApp(emulatorConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators (use try/catch to avoid errors if already connected)
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
    } catch (error) {
      // Already connected to emulator
      console.log('Auth emulator already connected');
    }

    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Already connected to emulator
      console.log('Firestore emulator already connected');
    }

    console.log('✅ Firebase configured for emulator (Auth: localhost:9099, Firestore: localhost:8080)');
  } catch (error) {
    console.error('Firebase emulator initialization error:', error);
  }
} else if (isFirebaseConfigured()) {
  // ☁️ PRODUCTION MODE
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Configure persistence to keep user logged in
    if (auth && typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Error setting persistence:', error);
      });
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn(
    '⚠️  Firebase credentials not configured. Please create .env.local file with Firebase config.'
  );
}

export { auth, db };
export default app;
