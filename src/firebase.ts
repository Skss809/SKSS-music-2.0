import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

// Support both environment variables (Vercel/Production) and JSON config (Local/Dev)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;

let app;
let db: any = {};
let auth: any = { currentUser: null, onAuthStateChanged: () => () => {} };

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "TODO_KEYHERE") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firestoreDatabaseId);
    auth = getAuth(app);
  } else {
    console.warn("Firebase config is missing or contains placeholder values. Please check your environment variables or firebase-applet-config.json.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth };
