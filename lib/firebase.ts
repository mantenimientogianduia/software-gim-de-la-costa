import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import localConfig from '@/firebase-applet-config.json';

// Try to get config from environment variable (for Vercel), fallback to local file
const getFirebaseConfig = () => {
  const envConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  if (envConfig) {
    try {
      return JSON.parse(envConfig);
    } catch (e) {
      console.error('Error parsing NEXT_PUBLIC_FIREBASE_CONFIG:', e);
    }
  }
  return localConfig;
};

const firebaseConfig = getFirebaseConfig();

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const storage = getStorage(app);
