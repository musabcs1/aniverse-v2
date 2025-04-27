import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Play, BookmarkPlus, Share2, StarIcon, CalendarIcon, ClockIcon, Clapperboard } from 'lucide-react';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSeason1Selected, setIsSeason1Selected] = useState(false);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div
            style={{
              position: 'absolute',
              top: '99px',
              left: '16px',
              width: '348px',
              height: '523px'
            }}
          >
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover rounded-lg shadow-xl"
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: '104px',
              left: '394px'
            }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
            <div className="flex items-center gap-4 text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-[#0DFFFF]" />
                <span>{anime.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#0DFFFF]" />
                <span>{anime.releaseYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-[#0DFFFF]" />
                <span>{anime.episodes} Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-[#0DFFFF]" />
                <span>{anime.studio}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((genre, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 text-sm rounded-full bg-[#31055A] text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-gray-300 mb-6">{anime.description}</p>
            <div className="space-y-4">
              <button className="bg-[#9B00FF] text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#7A00CC]">
                <Play className="h-5 w-5" />
                Watch Now
              </button>
              <button className="bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform">
                <BookmarkPlus className="h-5 w-5" />
                Add to List
              </button>
              <button className="bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Seasons</h2>
            <button
              className={`bg-[#00F0FF] text-white w-full py-3 rounded-lg hover:bg-[#00C0CC] ${isSeason1Selected ? 'border-2 border-[#007A99]' : ''}`}
              onClick={() => setIsSeason1Selected(true)}
            >
              Season 1
            </button>
            <p className="text-gray-300 mt-6">{anime.description}</p>
          </div>

          {/* Right Column */}
          <div
            style={{
              position: 'absolute',
              top: '116px',
              left: '960px'
            }}
          >
            <h2 className="text-3xl font-extrabold text-white mb-4">Episodes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Array.from({ length: anime.episodes }, (_, i) => (
                <div
                  key={i}
                  className="w-full p-4 bg-[#2B0144] rounded-lg text-white hover:bg-[#6B00B3]/20 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-500" />
                    <span className="text-lg">Episode {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;