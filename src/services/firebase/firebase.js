import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_FIREBASE_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const Firebase = firebase;

// Initialize Firebase
export const app = firebase.initializeApp(firebaseConfig);

// Initalize App Check (reCAPTCHA v3)
const appCheck = firebase.appCheck();
appCheck.activate(process.env.REACT_APP_CHECK_PUBLIC_KEY, true);

// Intialize firebase auth
export const auth = app.auth();

// initialize firestore database
export const db = firebase.firestore();
