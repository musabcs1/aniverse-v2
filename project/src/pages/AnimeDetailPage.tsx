import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Play, BookmarkPlus, Share2Icon, StarIcon, CalendarIcon, ClockIcon, UsersIcon } from 'lucide-react';

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
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex gap-8">
            <div className="w-[300px] h-[450px] bg-[#2B0144] rounded-lg"></div>
            <div className="flex-1">
              <div className="h-8 w-1/2 bg-[#2B0144] rounded mb-4"></div>
              <div className="h-4 w-full bg-[#2B0144] rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-[#2B0144] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            {error instanceof Error ? error.message : 'Error loading anime details'}
          </div>
          <button 
            onClick={() => navigate('/anime')}
            className="bg-[#9B00FF] text-white px-6 py-2 rounded-lg hover:bg-[#7A00CC]"
          >
            Back to Anime List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] pt-20">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Left Column */}
          <div className="w-[300px] flex-shrink-0">
            <div className="sticky top-24">
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="w-full aspect-[2/3] object-cover rounded-lg shadow-xl mb-6"
              />
              <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
              <div className="flex items-center gap-4 text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-[#00FF85]" />
                  <span>{anime.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-white" />
                  <span>{anime.releaseYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-white" />
                  <span>{anime.episodes} Episodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-white" />
                  <span>{anime.studio}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm rounded-full bg-[#6B00B3] text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <p className="text-gray-300 mb-6">{anime.description}</p>
              <button className="bg-[#9B00FF] text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#7A00CC] mb-4">
                <Play className="h-5 w-5" />
                Watch Now
              </button>
              <button className="bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] mb-4">
                <BookmarkPlus className="h-5 w-5" />
                Add to List
              </button>
              <button className="bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A]">
                <Share2Icon className="h-5 w-5" />
                Share
              </button>
              <h2 className="text-2xl font-bold text-white mt-8 mb-4">Seasons</h2>
              <button className="bg-[#00F0FF] text-white w-full py-3 rounded-lg hover:bg-[#00C0CC]">
                Season 1
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
            <div className="grid gap-3">
              {Array.from({ length: anime.episodes }, (_, i) => (
                <button
                  key={i}
                  className="w-full p-4 bg-[#2B0144] rounded-lg text-white hover:bg-[#6B00B3]/20 transition-colors flex items-center justify-between group"
                >
                  <span>Season 1 Episode {i + 1}</span>
                  <Play className="h-5 w-5 text-white" />
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
