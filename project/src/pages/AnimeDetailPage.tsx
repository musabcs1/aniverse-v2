import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Play, StarIcon } from 'lucide-react';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="flex gap-8">
              <div className="w-64 h-96 bg-surface-light rounded-lg"></div>
              <div className="flex-1">
                <div className="h-10 bg-surface-light rounded w-3/4 mb-4"></div>
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

  const episodes = Array.from(
    { length: anime.episodes || 26 }, 
    (_, i) => `Episode ${i + 1}`
  );

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Left Side - Anime Info */}
          <div className="w-[300px] flex-shrink-0">
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg mb-6"
            />
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <StarIcon className="h-5 w-5 text-secondary" />
                <span>{anime.rating.toFixed(1)} Rating</span>
              </div>
              <div className="text-gray-400">
                {anime.episodes} Episodes
              </div>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm rounded-full bg-primary/30 text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <button className="btn-primary w-full flex items-center justify-center space-x-2 py-3">
                <Play className="h-5 w-5" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>

          {/* Right Side - Episodes */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
            <p className="text-gray-400 mb-8">{anime.description}</p>

            <h2 className="text-2xl font-semibold text-white mb-4">Episodes</h2>
            <div className="grid gap-3">
              {episodes.map((episode, index) => (
                <button
                  key={index}
                  className="bg-[#1f1f3a] w-full p-4 rounded-lg text-white hover:bg-[#2a2a4a] transition-colors flex items-center justify-between group"
                >
                  <span className="font-medium">{episode}</span>
                  <Play className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;