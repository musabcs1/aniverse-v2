// filepath: project/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDpU9R1Rg662_29X0nuUYBYylNWCmmYdYY",
  authDomain: "aniverse5.firebaseapp.com",
  projectId: "aniverse5",
  storageBucket: "aniverse5.firebasestorage.app",
  messagingSenderId: "486938827338",
  appId: "1:486938827338:web:4fe1d13775a1eafe28a4b3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.log('The current browser doesn\'t support persistence');
    }
  });