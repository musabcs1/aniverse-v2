// filepath: project/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

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

// Initialize Firestore with multi-tab persistence enabled
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: 50 * 1024 * 1024 // 50 MB cache size
  })
});