import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB32Ew8ChRHrgDD6Ut2vbM98vnQ5773fho",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "rarebooks-f9518.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "rarebooks-f9518",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "rarebooks-f9518.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "609469190487",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:609469190487:web:233ffdb0e5f9b39bb82e12",
  measurementId: "G-F0NSL648JQ"
};

// Initialize Firebase
let app: any;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);  // ← This is what was missing!
  auth = getAuth(app);
  storage = getStorage(app);
  console.log('✅ Firebase initialized successfully');
  console.log('📊 Project ID:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { db, auth, storage };
export default app;
