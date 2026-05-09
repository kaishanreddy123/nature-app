// src/firebase.js

import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0lHwpw2_2yEPixCmj4ELC2oR8XRiia4w",
  authDomain: "natureapp786.firebaseapp.com",
  projectId: "natureapp786",
  storageBucket: "natureapp786.firebasestorage.app",
  messagingSenderId: "182449328882",
  appId: "1:182449328882:web:8595824b99faefbe0e766b",
  measurementId: "G-F6VQF5PTDM",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);