// ===============================
// Firebase Configuration
// ===============================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDisIltlN9rR-tltlJaClGBld9usTYLmxM",
  authDomain: "luxemarket-7c4c0.firebaseapp.com",
  projectId: "luxemarket-7c4c0",
  storageBucket: "luxemarket-7c4c0.firebasestorage.app",
  messagingSenderId: "81635666948",
  appId: "1:81635666948:web:867963294814113a645951",
  measurementId: "G-0QQKRWXKDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
