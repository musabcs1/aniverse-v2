import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import animeList from './animeList.json'; // Ensure you have a JSON file with the anime list
import { firebaseConfig } from '../src/firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importAnime() {
  try {
    const animeCollection = collection(db, 'anime');

    for (const anime of animeList) {
      await addDoc(animeCollection, anime);
      console.log(`Added anime: ${anime.title}`);
    }

    console.log('Anime list imported successfully!');
  } catch (error) {
    console.error('Error importing anime list:', error);
  }
}

importAnime();