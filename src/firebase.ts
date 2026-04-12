import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app;
let db: any = {};
let auth: any = { currentUser: null, onAuthStateChanged: () => () => {} };

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
  } else {
    console.warn("Firebase config is missing or invalid.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth };
