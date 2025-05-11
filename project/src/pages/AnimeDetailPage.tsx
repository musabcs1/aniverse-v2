import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Play, BookmarkPlus, Share2, StarIcon, CalendarIcon, ClockIcon, Clapperboard, Check } from 'lucide-react';
import { ListPlus } from '../components/ui/Icons';
import { auth } from '../firebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomListManager from '../components/ui/CustomListManager';

const AnimeDetailPage: React.FC = () => {
  const { animeId } = useParams<{ animeId: string }>();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCustomListModal, setShowCustomListModal] = useState(false);

  const { data: anime, isLoading, error } = useQuery<Anime>({
    queryKey: ['anime', animeId],
    queryFn: async () => {
      if (!animeId) throw new Error('No anime ID provided');
      const docRef = doc(db, 'anime', animeId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Anime not found');
      return { ...docSnap.data(), id: docSnap.id } as Anime;
    },
    enabled: !!animeId,
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

  const handleToggleWatchlist = async () => {
    if (!auth.currentUser || !anime) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);

      if (isInWatchlist) {
        await updateDoc(userDocRef, {
          watchlist: arrayRemove(anime.id),
          watching: increment(-1)
        });
        toast.success(`${anime.title} has been removed from your watchlist.`);
      } else {
        await updateDoc(userDocRef, {
          watchlist: arrayUnion(anime.id),
          watching: increment(1)
        });
        toast.success(`${anime.title} has been added to your watchlist.`);
      }

      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist. Please try again.');
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!auth.currentUser || !anime) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        toast.error('User data not found');
        return;
      }

      const userData = userSnapshot.data();
      
      if (isCompleted) {
        await updateDoc(userDocRef, {
          completed: arrayRemove(anime.id),
          'stats.completed': increment(-1),
          xp: increment(-20)
        });
        toast.success(`${anime.title} removed from completed list (-20 XP)`);
      } else {
        const updatedData: Record<string, any> = {
          completed: arrayUnion(anime.id),
          'stats.completed': increment(1),
          xp: increment(20)
        };

        if (isInWatchlist) {
          updatedData.watchlist = arrayRemove(anime.id);
          setIsInWatchlist(false);
        }

        await updateDoc(userDocRef, updatedData);
        await updateDoc(userDocRef, {
          level: Math.floor((userData.xp || 0) / 1000) + 1
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
    const urlFriendlySeasonName = season.name.toLowerCase().replace(' ', '-');
    navigate(`/anime/${animeId}/season/${urlFriendlySeasonName}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] pt-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 h-[523px] bg-[#2B0144] rounded-lg"></div>
            <div className="lg:col-span-6">
              <div className="h-8 w-1/2 bg-[#2B0144] rounded mb-4"></div>
              <div className="h-4 w-full bg-[#2B0144] rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-[#2B0144] rounded"></div>
            </div>
            <div className="lg:col-span-3 h-[523px] bg-[#2B0144] rounded-lg"></div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Left Column - Cover Image */}
                <div className="md:col-span-1 lg:col-span-3">
                  <div className="flex justify-center md:block">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="w-full max-w-[250px] md:max-w-full h-auto md:h-[523px] object-cover rounded-lg shadow-xl"
                    />
                  </div>
                </div>

                {/* Middle Column - Info */}
                <div className="md:col-span-1 lg:col-span-6">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">{anime.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-300 mb-3 md:mb-4">
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-4 w-4 md:h-5 md:w-5 text-[#0DFFFF]" />
                      <span>{anime.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-[#0DFFFF]" />
                      <span>{anime.releaseYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 md:h-5 md:w-5 text-[#0DFFFF]" />
                      <span>{anime.episodes} Episodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clapperboard className="h-4 w-4 md:h-5 md:w-5 text-[#0DFFFF]" />
                      <span>{anime.studio}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs md:text-sm rounded-full bg-[#31055A] text-white"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm md:text-base mb-6">{anime.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button 
                      className="bg-[#9B00FF] text-white w-full py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#7A00CC] transition-transform hover:scale-105 text-sm md:text-base"
                      onClick={() => anime.seasons && anime.seasons.length > 0 && handleSeasonClick(anime.seasons[0])}
                    >
                      <Play className="h-4 w-4 md:h-5 md:w-5" />
                      Watch Now
                    </button>
                    <button 
                      className={`bg-black text-white w-full py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform text-sm md:text-base ${isInWatchlist ? 'bg-[#7A00CC]' : ''}`}
                      onClick={handleToggleWatchlist}
                    >
                      <BookmarkPlus className="h-4 w-4 md:h-5 md:w-5" />
                      {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </button>
                    <button 
                      className={`bg-black text-white w-full py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform text-sm md:text-base ${isCompleted ? 'bg-green-600' : ''}`}
                      onClick={handleMarkAsCompleted}
                    >
                      <Check className="h-4 w-4 md:h-5 md:w-5" />
                      {isCompleted ? 'Completed!' : 'Mark as Completed'}
                    </button>
                    <div className="flex gap-3">
                      <button className="bg-black text-white flex-1 py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform text-sm md:text-base">
                        <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                        Share
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 bg-surface rounded-lg hover:bg-surface-light hover:scale-105 transition-transform text-sm md:text-base"
                        onClick={() => setShowCustomListModal(true)}
                      >
                        <ListPlus className="h-4 w-4 md:h-5 md:w-5" />
                        Lists
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Seasons */}
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="bg-surface rounded-xl p-4 md:p-6">
                    <h2 className="text-xl font-bold text-white mb-3 md:mb-4">Seasons</h2>
                    <div className="space-y-2 md:space-y-3">
                      {anime.seasons && Array.isArray(anime.seasons) ? (
                        anime.seasons.map((season: { name: string; episodes: number }, index: number) => (
                          <button
                            key={index}
                            className="bg-surface-dark text-white w-full py-2.5 md:py-3 rounded-lg hover:bg-primary transition-colors px-4 md:px-6 flex items-center justify-between group text-sm md:text-base"
                            onClick={() => handleSeasonClick(season)}
                          >
                            <span>{season.name}</span>
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-white">
                              <span className="text-xs md:text-sm">{season.episodes} Episodes</span>
                              <Play className="h-3 w-3 md:h-4 md:w-4" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-4">No seasons available.</p>
                      )}
                    </div>
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
      {showCustomListModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <CustomListManager
              mode="add"
              animeId={anime.id}
              anime={anime}
              onClose={() => setShowCustomListModal(false)}
              className="max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeDetailPage;