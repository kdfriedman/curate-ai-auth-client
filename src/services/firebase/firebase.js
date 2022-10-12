import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';

// set firebase creds
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initalize App Check
if (process.env.NODE_ENV === 'development') {
  window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_PUBLIC_KEY),
  isTokenAutoRefreshEnabled: true,
});

// Intialize Auth
export const auth = getAuth(app);

// initialize Firestore
export const db = getFirestore(app);
