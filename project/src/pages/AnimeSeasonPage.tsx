import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Anime } from '../types';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/layout/Header';

const AnimeSeasonPage: React.FC = () => {
  const navigate = useNavigate();
  const { animeId, seasonName } = useParams<{ animeId: string; seasonName: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const { data: anime, isLoading, error } = useQuery<Anime>({
    queryKey: ['anime', animeId],
    queryFn: async () => {
      try {
        // Wait for auth to initialize
        await new Promise<void>((resolve) => {
          const unsubscribe = auth.onAuthStateChanged(() => {
            unsubscribe();
            resolve();
          });
        });

        if (!animeId) {
          console.error('No anime ID provided in URL');
          throw new Error('No anime ID provided');
        }

        console.log('Fetching anime with ID:', animeId);
        const animeDoc = doc(db, 'anime', animeId);
        const animeSnapshot = await getDoc(animeDoc);

        if (!animeSnapshot.exists()) {
          console.error(`Anime with ID ${animeId} not found in Firestore`);
          throw new Error('Anime not found');
        }

        const animeData = { ...animeSnapshot.data(), id: animeSnapshot.id } as Anime;
        console.log('Anime data loaded:', animeData);
        return animeData;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
        console.error('Error in anime query:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    enabled: !!animeId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex gap-8">
            <div className="w-1/4 h-[600px] bg-[#2B0144] rounded-lg"></div>
            <div className="flex-1 h-[600px] bg-[#2B0144] rounded-lg"></div>
            <div className="w-1/4 h-[600px] bg-[#2B0144] rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error instanceof Error && error.message) {
    console.error('Error loading anime details:', error);
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            {error.message}
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#9B00FF] text-white px-6 py-2 rounded-lg hover:bg-[#7A00CC]"
          >
            Back to Anime Details
          </button>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            Failed to load anime data
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#9B00FF] text-white px-6 py-2 rounded-lg hover:bg-[#7A00CC]"
          >
            Back to Anime Details
          </button>
        </div>
      </div>
    );
  }

  if (!anime.seasons || !Array.isArray(anime.seasons)) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">No seasons available for this anime</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#9B00FF] text-white px-6 py-2 rounded-lg hover:bg-[#7A00CC]"
          >
            Back to Anime Details
          </button>
        </div>
      </div>
    );
  }

  const selectedSeason = anime.seasons?.find((season) => {
    // Convert both the URL parameter and season name to the same format for comparison
    const urlFriendlySeasonName = season.name.toLowerCase().replace(' ', '-');
    return urlFriendlySeasonName === seasonName;
  });

  if (!selectedSeason) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">Season not found</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#9B00FF] text-white px-6 py-2 rounded-lg hover:bg-[#7A00CC]"
          >
            Back to Anime Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      <div className="flex flex-grow bg-[#0D0D1A] pt-20">
        {/* Episodes List */}
        <div className="w-1/4 bg-[#1A1A2E] text-white overflow-y-auto">
          <button
            className="w-full bg-red-600 py-3 text-center text-white font-bold hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            Back to Details
          </button>
          <h2 className="text-center text-xl font-bold py-4">Episodes in {selectedSeason.name}</h2>
          <ul>
            {Array.from({ length: selectedSeason.episodes }, (_, i) => (
              <li
                key={i}
                className="py-2 px-4 hover:bg-red-500 cursor-pointer border-b border-gray-700"
              >
                Episode {i + 1}
              </li>
            ))}
          </ul>
        </div>

        {/* Video Player and Thumbnails */}
        <div className="flex-1 p-4">
          <div className="bg-black w-full h-64 flex items-center justify-center mb-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">▶</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: selectedSeason.episodes }, (_, i) => (
              <img
                key={i}
                src={`https://via.placeholder.com/150?text=Episode+${i + 1}`}
                alt={`Episode ${i + 1}`}
                className="w-full h-32 object-cover rounded hover:opacity-80 cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Streaming Servers */}
        <div className="w-1/4 bg-[#1A1A2E] text-white overflow-y-auto">
          <h2 className="text-center text-xl font-bold py-4">Streaming Servers</h2>
          <ul>
            {['EarnVids', 'StreamHG', 'listeamed', 'upshare', 'VK', 'luluvdo', 'ok', 'vid1sha'].map((server) => (
              <li
                key={server}
                className="py-2 px-4 hover:bg-blue-500 cursor-pointer border-b border-gray-700 flex items-center justify-between"
              >
                {server}
                <button className="bg-green-500 text-white px-2 py-1 rounded">▶</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnimeSeasonPage;