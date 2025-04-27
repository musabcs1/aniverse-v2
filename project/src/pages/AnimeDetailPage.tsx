import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  const { data: anime, isLoading, error } = useQuery<Anime>({
    queryKey: ['anime', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      const animeDoc = doc(db, 'anime', id);
      const animeSnapshot = await getDoc(animeDoc);
      
      if (!animeSnapshot.exists()) {
        throw new Error('Anime not found');
      }
      
      return { ...animeSnapshot.data(), id: animeSnapshot.id } as Anime;
    },
    enabled: !!id,
    retry: false,
  });

  const episodes = React.useMemo(() => {
    if (!anime) return [];
    
    const totalSeasons = anime.seasons || 1;
    const allEpisodes = [];
    for (let season = 1; season <= totalSeasons; season++) {
      allEpisodes.push({
        season,
        episodes: Array.from(
          { length: anime.episodesPerSeason || 12 }, 
          (_, i) => `Season ${season} Episode ${i + 1}`
        ),
      });
    }
    return allEpisodes;
  }, [anime]);

  const handleSeasonSelect = (season: number) => {
    setSelectedSeason(season);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
              <div className="w-64 h-96 bg-surface-light rounded-lg mb-4 md:mb-0 md:mr-8"></div>
              <div className="flex-1">
                <div className="h-10 bg-surface-light rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-surface-light rounded w-full mb-2"></div>
                <div className="h-4 bg-surface-light rounded w-full mb-2"></div>
                <div className="h-4 bg-surface-light rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            {error instanceof Error ? error.message : 'Error loading anime details'}
          </div>
          <p className="text-gray-400 mb-4">Redirecting to anime directory...</p>
          <button 
            onClick={() => navigate('/anime')}
            className="btn-primary"
          >
            Go to Anime Directory
          </button>
        </div>
      </div>
    );
  }

  if (!anime) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="w-64 h-96 object-cover rounded-lg shadow-lg mb-4 md:mb-0 md:mr-8"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
            <p className="text-gray-400 mb-4">{anime.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                <p className="text-gray-400">{anime.status}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Studio</h3>
                <p className="text-gray-400">{anime.studio}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Release Year</h3>
                <p className="text-gray-400">{anime.releaseYear}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Rating</h3>
                <p className="text-gray-400">{anime.rating.toFixed(1)}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm rounded-full bg-primary/30 text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Seasons</h2>
          <div className="flex space-x-4">
            {episodes.map((seasonData, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedSeason === seasonData.season ? 'bg-secondary' : 'bg-surface-light hover:bg-surface'
                }`}
                onClick={() => handleSeasonSelect(seasonData.season)}
              >
                Season {seasonData.season}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes
              .find((seasonData) => seasonData.season === selectedSeason)
              ?.episodes.map((episode, index) => (
                <div
                  key={index}
                  className="bg-surface-light p-4 rounded-lg text-white shadow-md hover:bg-surface transition-colors cursor-pointer"
                >
                  <h3 className="font-medium">{episode}</h3>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;