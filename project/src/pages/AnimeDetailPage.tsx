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
  const { animeId } = useParams<{ animeId: string }>();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 h-[523px] bg-primary/20 rounded-lg"></div>
            <div className="lg:col-span-6">
              <div className="h-8 w-1/2 bg-primary/20 rounded mb-4"></div>
              <div className="h-4 w-full bg-primary/20 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-primary/20 rounded"></div>
            </div>
            <div className="lg:col-span-3 h-[523px] bg-primary/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            {error instanceof Error ? error.message : 'Error loading anime details'}
          </div>
          <button 
            onClick={() => navigate('/anime')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
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
          <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Cover Image */}
                <div className="lg:col-span-3">
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    className="w-full h-[523px] object-cover rounded-lg shadow-xl"
                  />
                </div>

                {/* Middle Column - Info */}
                <div className="lg:col-span-6">
                  <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
                  <div className="flex items-center gap-4 text-gray-300 mb-4">
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 text-primary" />
                      <span>{anime.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <span>{anime.releaseYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-primary" />
                      <span>{anime.episodes} Episodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clapperboard className="h-5 w-5 text-primary" />
                      <span>{anime.studio}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 text-sm rounded-full bg-primary/30 text-white"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6">{anime.description}</p>
                  <div className="space-y-4">
                    <button 
                      className="bg-primary text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-transform hover:scale-105"
                      onClick={() => anime.seasons && anime.seasons.length > 0 && handleSeasonClick(anime.seasons[0])}
                    >
                      <Play className="h-5 w-5" />
                      Watch Now
                    </button>
                    <button 
                      className={`bg-black text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-white hover:bg-[#1A1A1A] hover:scale-105 transition-transform ${isInWatchlist ? 'bg-primary-dark' : ''}`}
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
                </div>

                {/* Right Column - Seasons */}
                <div className="lg:col-span-3">
                  <div className="bg-surface rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Seasons</h2>
                    <div className="space-y-3">
                      {anime.seasons && Array.isArray(anime.seasons) ? (
                        anime.seasons.map((season: { name: string; episodes: number }, index: number) => (
                          <button
                            key={index}
                            className="bg-surface-dark text-white w-full py-3 rounded-lg hover:bg-primary transition-colors px-6 flex items-center justify-between group"
                            onClick={() => handleSeasonClick(season)}
                          >
                            <span>{season.name}</span>
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-white">
                              <span className="text-sm">{season.episodes} Episodes</span>
                              <Play className="h-4 w-4" />
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
      <footer className="bg-background py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>❤</p>
        </div>
      </footer>
    </div>
  );
};

export default AnimeDetailPage;