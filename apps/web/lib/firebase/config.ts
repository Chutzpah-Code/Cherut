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

const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
};

const useEmulator = () => {
  return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined';
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: any = null;

if (useEmulator()) {
  const emulatorConfig = {
    apiKey: 'demo-key',
    authDomain: 'demo-project.firebaseapp.com',
    projectId: 'demo-project',
    storageBucket: 'demo-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'demo-app-id',
  };

  try {
    app = getApps().length === 0 ? initializeApp(emulatorConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch {
    // Already connected
  }
} else if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    if (auth && typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence).catch(() => {});
    }
  } catch {
    // init error
  }
}

export { auth, db };
export default app;
