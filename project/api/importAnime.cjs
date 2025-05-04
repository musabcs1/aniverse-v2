"use strict";
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } = require("firebase/firestore");
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

const updateAnimeCollection = async () => {
  try {
    const animeList = JSON.parse(fs.readFileSync(animeListPath, 'utf-8'));
    const animeCollection = collection(db, 'anime');

    // Fetch existing documents to clean up old data
    const existingDocs = await getDocs(animeCollection);
    for (const docSnapshot of existingDocs.docs) {
      await deleteDoc(doc(animeCollection, docSnapshot.id));
      console.log(`Deleted old document: ${docSnapshot.id}`);
    }

    // Add updated documents
    for (const anime of animeList) {
      const docId = generateDocId(anime);
      const animeDoc = doc(animeCollection, docId);
      const animeData = {
        id: docId,
        title: anime.title,
        description: anime.description,
        coverImage: anime.coverImage,
        bannerImage: anime.bannerImage || null,
        episodes: anime.episodes,
        genres: anime.genres,
        rating: anime.rating,
        releaseYear: anime.releaseYear,
        status: anime.status,
        studio: anime.studio,
        voiceActors: anime.voiceActors || [],
        seasons: anime.seasons || [{ name: 'Season 1', episodes: anime.episodes }],
      };

      await setDoc(animeDoc, animeData);
      console.log(`Updated anime: ${anime.title}`);
    }

    console.log('Anime collection updated successfully.');
  } catch (error) {
    console.error('Error updating anime collection:', error);
  }
};

updateAnimeCollection();
