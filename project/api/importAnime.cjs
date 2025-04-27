"use strict";
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpU9R1Rg662_29X0nuUYBYylNWCmmYdYY",
  authDomain: "aniverse5.firebaseapp.com",
  projectId: "aniverse5",
  storageBucket: "aniverse5.firebasestorage.app",
  messagingSenderId: "486938827338",
  appId: "1:486938827338:web:4fe1d13775a1eafe28a4b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const animeListPath = path.resolve(__dirname, 'animeList.json');

const generateDocId = (anime) => {
  // Generate a URL-friendly ID from the title
  return anime.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const syncAnimeListToFirestore = async () => {
  try {
    const animeList = JSON.parse(fs.readFileSync(animeListPath, 'utf-8'));
    const animeCollection = collection(db, 'anime');

    for (const anime of animeList) {
      const docId = generateDocId(anime);
      const animeDoc = doc(animeCollection, docId);
      const animeData = {
        ...anime,
        id: docId, // Use the same ID for both document ID and data
      };

      await setDoc(animeDoc, animeData);
      console.log(`Synced anime: ${anime.title}`);
    }

    console.log('Anime list synced successfully.');
  } catch (error) {
    console.error('Error syncing anime list:', error);
  }
};

// Watch for changes in animeList.json
fs.watchFile(animeListPath, { interval: 1000 }, (curr, prev) => {
  console.log('Detected changes in animeList.json. Syncing to Firestore...');
  syncAnimeListToFirestore();
});

// Initial sync
syncAnimeListToFirestore();
