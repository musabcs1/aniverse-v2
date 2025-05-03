import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Play, BookmarkPlus, Share2, StarIcon, CalendarIcon, ClockIcon, Clapperboard, Check } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<{ name: string; episodes: number } | null>(null);
  const [isSeasonsVisible, setIsSeasonsVisible] = useState(false); // State to control visibility of seasons

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

  useEffect(() => {
    if (!auth.currentUser || !anime) return;

    const checkUserStatus = async () => {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser!.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setIsInWatchlist(userData.watchlist?.includes(anime.id));
          setIsCompleted(userData.completed?.includes(anime.id));
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    checkUserStatus();
  }, [anime]);

  useEffect(() => {
    if (selectedSeason) {
      // Automatically update the episodes section when a season is selected
      console.log(`Displaying episodes for ${selectedSeason.name}`);
    }
  }, [selectedSeason]);

  const handleToggleWatchlist = async () => {
    if (!auth.currentUser) {
      console.error('User is not logged in.');
      return;
    }
    if (!anime) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);

      if (isInWatchlist) {
        // Remove from watchlist
        await updateDoc(userDocRef, {
          watchlist: arrayRemove(anime.id),
          watching: increment(-1)
        });
        toast.success(`${anime.title} has been removed from your watchlist.`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Add to watchlist
        await updateDoc(userDocRef, {
          watchlist: arrayUnion(anime.id),
          watching: increment(1)
        });
        toast.success(`${anime.title} has been added to your watchlist.`, {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!auth.currentUser || !anime) {
      console.error('User is not logged in or anime not found');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        toast.error('User data not found');
        return;
      }

      const userData = userSnapshot.data();
      
      if (isCompleted) {
        // Remove from completed list
        await updateDoc(userDocRef, {
          completed: arrayRemove(anime.id),
          'stats.completed': increment(-1),
          xp: increment(-20) // Deduct XP only when unmarking as completed
        });

        toast.success(`${anime.title} removed from completed list (-20 XP)`);
      } else {
        // Add to completed list
        const updatedData: any = {
          completed: arrayUnion(anime.id),
          'stats.completed': increment(1),
          xp: increment(20) // Give XP for completing an anime
        };

        // Remove from watchlist if it's there
        if (isInWatchlist) {
          updatedData.watchlist = arrayRemove(anime.id);
          setIsInWatchlist(false);
        }

        await updateDoc(userDocRef, updatedData);

        // Update user level based on new XP
        const newXP = (userData.xp || 0) + 20;
        await updateDoc(userDocRef, {
          level: Math.floor(newXP / 1000) + 1
        });

        toast.success(`${anime.title} marked as completed! (+20 XP)`);
      }

      setIsCompleted(!isCompleted);
    } catch (error) {
      console.error('Error updating completed status:', error);
      toast.error('Failed to update completed status');
    }
  };

  const handleSeasonClick = (season: { name: string; episodes: number }) => {
    setSelectedSeason(season); // Set the selected season
    setIsSeasonsVisible(true); // Ensure the seasons section remains visible
  };

  const handleWatchNowClick = () => {
    setIsSeasonsVisible((prev) => !prev); // Toggle the visibility of the seasons section
    if (isSeasonsVisible) {
      setSelectedSeason(null); // Hide the episodes section if seasons are being hidden
    }
  };

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
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="relative min-h-screen">
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
                    <button 
                      className="bg-[#9B00FF] text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#7A00CC]"
                      onClick={handleWatchNowClick}
                    >
                      <Play className="h-5 w-5" />
                      Watch Now
                    </button>
                    <button 
                      className={`bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform ${isInWatchlist ? 'bg-[#7A00CC]' : ''}`}
                      onClick={handleToggleWatchlist}
                    >
                      <BookmarkPlus className="h-5 w-5" />
                      {isInWatchlist ? 'Remove from List' : 'Add to List'}
                    </button>
                    <button 
                      className={`bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform ${isCompleted ? 'bg-green-600' : ''}`}
                      onClick={handleMarkAsCompleted}
                    >
                      <Check className="h-5 w-5" />
                      {isCompleted ? 'Completed!' : 'Mark as Completed'}
                    </button>
                    <button className="bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform">
                      <Share2 className="h-5 w-5" />
                      Share
                    </button>
                  </div>
                  {isSeasonsVisible && (
                    <div className="mt-6">
                      <h2 className="text-2xl font-bold text-white mb-4">Seasons</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {anime.seasons && Array.isArray(anime.seasons) ? (
                          anime.seasons.map((season: { name: string; episodes: number }, index: number) => (
                            <button
                              key={index}
                              className="bg-[#00F0FF] text-white w-full py-3 rounded-lg hover:bg-[#00C0CC] transition-colors"
                              onClick={() => handleSeasonClick(season)}
                            >
                              {season.name}
                            </button>
                          ))
                        ) : (
                          <p className="text-gray-400">No seasons available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div
                  style={{
                    position: 'absolute',
                    top: '116px',
                    left: '960px'
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedSeason && (
                      <div className="mt-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Episodes in {selectedSeason.name}</h2>
                        <div className="overflow-y-auto max-h-96 space-y-4">
                          {Array.from({ length: selectedSeason.episodes }, (_, i) => (
                            <div
                              key={i}
                              className="w-full p-4 bg-[#1f0a39] rounded-lg text-white hover:bg-[#00f0ff]/20 transition-colors flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-blue-500" />
                                <span className="text-lg">Episode {i + 1}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </main>
      <footer className="bg-[#0D0D1A] py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>❤</p>
        </div>
      </footer>
    </div>
  );
};

export default AnimeDetailPage;