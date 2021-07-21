import firebase from 'firebase/app';

const initFirebaseService = () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDlZ98yKXdghO0sg3z5WQJos0ndfN71r3M',
    authDomain: 'curateapp-ai-fb-store.firebaseapp.com',
    projectId: 'curateapp-ai-fb-store',
    storageBucket: 'curateapp-ai-fb-store.appspot.com',
    messagingSenderId: '657944170396',
    appId: '1:657944170396:web:fa60f5dc5947fa7f678259',
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  return firebase;
};

export default initFirebaseService;
