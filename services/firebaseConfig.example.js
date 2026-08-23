/**
 * SafeWay V3 - Firebase Configuration Template
 * 
 * Instructions for SIH Judges & Developers:
 * 1. Copy this file to `services/firebaseConfig.js`
 * 2. Fill in your Firebase Project credentials from Firebase Console -> Project Settings
 * 3. SafeWay automatically connects to Firebase Realtime Database. If left unconfigured,
 *    SafeWay seamlessly falls back to Offline / Demo Mode with full local simulation.
 */

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
