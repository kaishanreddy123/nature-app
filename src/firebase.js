// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD0lHwpw2_2yEPixCmj4ELC2oR8XRiia4w",
  authDomain: "natureapp786.firebaseapp.com",
  projectId: "natureapp786",
  storageBucket: "natureapp786.firebasestorage.app",
  messagingSenderId: "182449328882",
  appId: "1:182449328882:web:8595824b99faefbe0e766b",
  measurementId: "G-F6VQF5PTDM"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Google Provider
export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);