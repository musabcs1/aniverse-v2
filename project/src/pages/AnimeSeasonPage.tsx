import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, Info, Clock, ChevronLeft, ChevronRight, Heart, Share2,
  Award
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Anime, AnimeEpisodes } from '../types';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from '../components/layout/Header';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Custom icon components to replace missing Lucide icons
const Star = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Calendar = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const Bookmark = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const AnimeSeasonPage: React.FC = () => {
  const navigate = useNavigate();
  const { animeId, seasonName } = useParams<{ animeId: string; seasonName: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodesData, setEpisodesData] = useState<AnimeEpisodes | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [embedCode, setEmbedCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [favorited, setFavorited] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'episodes' | 'info'>('episodes');
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [isUpdatingBookmark, setIsUpdatingBookmark] = useState(false);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Set initial language from i18n
  useEffect(() => {
    const currentLang = i18n.language.substring(0, 2);
    if (currentLang === 'tr' || currentLang === 'en') {
      setSelectedLanguage(currentLang);
    }
  }, [i18n.language]);

  const { data: anime, isLoading, error } = useQuery<Anime>({
    queryKey: ['anime', animeId],
    queryFn: async () => {
      const docRef = doc(db, 'anime', animeId!);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Anime not found');
      return docSnap.data() as Anime;
    }
  });

  // Check if anime is favorited or bookmarked by the user
  useEffect(() => {
    const checkUserInteractions = async () => {
      if (!user || !animeId) return;

      try {
        const userDataRef = doc(db, 'user_data', user.uid);
        const userDataSnap = await getDoc(userDataRef);

        if (userDataSnap.exists()) {
          const userData = userDataSnap.data();
          setFavorited(userData.favorites?.includes(animeId) || false);
          setBookmarked(userData.bookmarks?.includes(animeId) || false);
        }
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };

    checkUserInteractions();
  }, [user, animeId]);

  // Fetch episodes data
  useEffect(() => {
    if (animeId) {
      const fetchEpisodesData = async () => {
        try {
          setLoadingEpisodes(true);
          const episodesRef = doc(db, 'anime_episodes', animeId);
          const episodesDoc = await getDoc(episodesRef);
          
          if (episodesDoc.exists()) {
            setEpisodesData(episodesDoc.data() as AnimeEpisodes);
          }
        } catch (error) {
          console.error('Error fetching episodes data:', error);
        } finally {
          setLoadingEpisodes(false);
        }
      };
      
      fetchEpisodesData();
    }
  }, [animeId]);

  // Set embed code when episode is selected or language changes
  useEffect(() => {
    if (selectedEpisode !== null && episodesData && seasonName) {
      const formattedSeasonName = 
        anime?.seasons?.find(season => {
          const urlFriendlyName = season.name.toLowerCase().replace(' ', '-');
          return urlFriendlyName === seasonName;
        })?.name || '';
      
      const episodeNumber = String(selectedEpisode + 1);
      
      if (
        formattedSeasonName && 
        episodesData.seasons[formattedSeasonName] && 
        episodesData.seasons[formattedSeasonName][episodeNumber] &&
        episodesData.seasons[formattedSeasonName][episodeNumber].embedCodes
      ) {
        const episodeData = episodesData.seasons[formattedSeasonName][episodeNumber];
        
        // Try to get the selected language, fallback to any available language
        if (episodeData.embedCodes[selectedLanguage]) {
          setEmbedCode(episodeData.embedCodes[selectedLanguage]);
        } else {
          const availableLanguages = Object.keys(episodeData.embedCodes);
          if (availableLanguages.length > 0) {
            // If selected language is not available, update the selected language
            setSelectedLanguage(availableLanguages[0]);
            setEmbedCode(episodeData.embedCodes[availableLanguages[0]]);
          } else {
            setEmbedCode('');
          }
        }
      } else {
        setEmbedCode('');
      }
    } else {
      setEmbedCode('');
    }
  }, [selectedEpisode, episodesData, seasonName, anime, selectedLanguage]);

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  // Get available languages for the current episode
  const getAvailableLanguages = (): string[] => {
    if (selectedEpisode !== null && episodesData && seasonName && anime) {
      const formattedSeasonName = 
        anime.seasons?.find(season => {
          const urlFriendlyName = season.name.toLowerCase().replace(' ', '-');
          return urlFriendlyName === seasonName;
        })?.name || '';
      
      const episodeNumber = String(selectedEpisode + 1);
      
      if (
        formattedSeasonName && 
        episodesData.seasons[formattedSeasonName] && 
        episodesData.seasons[formattedSeasonName][episodeNumber] &&
        episodesData.seasons[formattedSeasonName][episodeNumber].embedCodes
      ) {
        return Object.keys(episodesData.seasons[formattedSeasonName][episodeNumber].embedCodes);
      }
    }
    
    return [];
  };

  // Get current episode info
  const getCurrentEpisodeInfo = () => {
    if (selectedEpisode !== null && episodesData && seasonName && anime) {
      const formattedSeasonName = 
        anime.seasons?.find(season => {
          const urlFriendlyName = season.name.toLowerCase().replace(' ', '-');
          return urlFriendlyName === seasonName;
        })?.name || '';
      
      const episodeNumber = String(selectedEpisode + 1);
      
      if (
        formattedSeasonName && 
        episodesData.seasons[formattedSeasonName] && 
        episodesData.seasons[formattedSeasonName][episodeNumber]
      ) {
        return episodesData.seasons[formattedSeasonName][episodeNumber];
      }
    }
    
    return null;
  };

  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (selectedEpisode === null) return;
    
    if (direction === 'prev' && selectedEpisode > 0) {
      setSelectedEpisode(selectedEpisode - 1);
    } else if (direction === 'next' && episodesData && seasonName && anime) {
      const formattedSeasonName = 
        anime.seasons?.find(season => {
          const urlFriendlyName = season.name.toLowerCase().replace(' ', '-');
          return urlFriendlyName === seasonName;
        })?.name || '';
      
      if (formattedSeasonName && 
          episodesData.seasons[formattedSeasonName] && 
          Object.keys(episodesData.seasons[formattedSeasonName]).length > selectedEpisode + 1) {
        setSelectedEpisode(selectedEpisode + 1);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error(t('common.loginRequired'));
      navigate('/login');
      return;
    }

    if (!animeId || isUpdatingFavorite) return;

    try {
      setIsUpdatingFavorite(true);
      const userDataRef = doc(db, 'user_data', user.uid);
      const userDataSnap = await getDoc(userDataRef);

      if (!userDataSnap.exists()) {
        // Create user data document if it doesn't exist
        await setDoc(userDataRef, {
          favorites: favorited ? [] : [animeId],
          createdAt: new Date()
        });
      } else {
        // Update existing document
        await updateDoc(userDataRef, {
          favorites: favorited 
            ? arrayRemove(animeId) 
            : arrayUnion(animeId)
        });
      }

      setFavorited(prev => !prev);
      toast.success(favorited 
        ? t('anime.removedFromFavorites')
        : t('anime.addedToFavorites')
      );
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error(t('common.errorOccurred'));
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error(t('common.loginRequired'));
      navigate('/login');
      return;
    }

    if (!animeId || isUpdatingBookmark) return;

    try {
      setIsUpdatingBookmark(true);
      const userDataRef = doc(db, 'user_data', user.uid);
      const userDataSnap = await getDoc(userDataRef);

      if (!userDataSnap.exists()) {
        // Create user data document if it doesn't exist
        await setDoc(userDataRef, {
          bookmarks: bookmarked ? [] : [animeId],
          createdAt: new Date()
        });
      } else {
        // Update existing document
        await updateDoc(userDataRef, {
          bookmarks: bookmarked 
            ? arrayRemove(animeId) 
            : arrayUnion(animeId)
        });
      }

      setBookmarked(prev => !prev);
      toast.success(bookmarked 
        ? t('anime.removedFromWatchlist')
        : t('anime.addedToWatchlist')
      );
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      toast.error(t('common.errorOccurred'));
    } finally {
      setIsUpdatingBookmark(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <div className="container mx-auto px-4 pt-24">
          <div className="animate-pulse flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4 h-[600px] bg-surface rounded-xl"></div>
            <div className="flex-1 h-[600px] bg-surface rounded-xl"></div>
            <div className="w-full md:w-1/4 h-[600px] bg-surface rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error instanceof Error) {
    let errorMessage = error.message;

    // Check for Firebase permission error
    if (errorMessage.includes('Missing or insufficient permissions')) {
      errorMessage = 'You do not have the necessary permissions to access this content.';
    }

    return (
      <div className="min-h-screen bg-background">
        <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <div className="container mx-auto px-4 pt-24 text-center">
          <div className="text-red-500 mb-4">{errorMessage}</div>
          <button 
            onClick={() => navigate(-1)}
            className="btn-primary py-2 px-6"
          >
            {t('anime.backToDetails')}
          </button>
        </div>
      </div>
    );
  }

  if (!anime || !anime.seasons || !Array.isArray(anime.seasons)) {
    return (
      <div className="min-h-screen bg-background">
        <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <div className="container mx-auto px-4 pt-24 text-center">
          <div className="text-red-500 mb-4">{t('anime.noSeasonsAvailable')}</div>
          <button 
            onClick={() => navigate(-1)}
            className="btn-primary py-2 px-6"
          >
            {t('anime.backToDetails')}
          </button>
        </div>
      </div>
    );
  }

  const selectedSeason = anime.seasons?.find((season) => {
    const urlFriendlySeasonName = season.name.toLowerCase().replace(' ', '-');
    return urlFriendlySeasonName === seasonName;
  });

  if (!selectedSeason) {
    return (
      <div className="min-h-screen bg-background">
        <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
        <div className="container mx-auto px-4 pt-24 text-center">
          <div className="text-red-500 mb-4">{t('anime.seasonNotFound')}</div>
          <button 
            onClick={() => navigate(-1)}
            className="btn-primary py-2 px-6"
          >
            {t('anime.backToDetails')}
          </button>
        </div>
      </div>
    );
  }

  // Check if episodes data is available
  const hasEpisodesData = 
    episodesData && 
    episodesData.seasons[selectedSeason.name] && 
    Object.keys(episodesData.seasons[selectedSeason.name]).length > 0;

  // Get available languages for the current episode
  const availableLanguages = getAvailableLanguages();
  
  // Get current episode data
  const currentEpisode = getCurrentEpisodeInfo();

  return (
    <div className="min-h-screen bg-background bg-gradient-to-b from-background to-surface-dark/30">
      <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      
      {/* Anime Info Banner */}
      <div 
        className="w-full h-64 bg-cover bg-center relative" 
        style={{
          backgroundImage: `url(${anime.coverImage || (anime as any).image})`,
          marginTop: '4rem'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent backdrop-blur-sm">
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="flex items-center gap-4">
              <img 
                src={(anime as any).image} 
                alt={anime.title} 
                className="w-24 h-36 object-cover rounded-lg border-2 border-primary shadow-lg shadow-primary/20" 
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{anime.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                    <span className="text-white">{(anime as any).rating || '?'}/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-white">{(anime as any).year || '?'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-purple-400" />
                    <span className="text-white capitalize">{(anime as any).type || 'TV'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {anime.genres?.map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-surface-light rounded-full text-xs text-white">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Control Bar */}
        <div className="flex items-center justify-between mb-6 bg-surface rounded-xl p-4 shadow-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{t('anime.backToDetails')}</span>
          </button>
          
          <div className="flex items-center">
            <span className="text-white font-medium mr-3">{selectedSeason.name}</span>
            <button 
              onClick={toggleFavorite}
              disabled={isUpdatingFavorite}
              className={`p-2 rounded-full hover:bg-surface-light transition-colors mr-2 ${isUpdatingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart 
                className={`h-5 w-5 ${favorited ? 'text-red-500' : 'text-gray-400'} ${isUpdatingFavorite ? 'animate-pulse' : ''}`} 
                fill={favorited ? 'currentColor' : 'none'} 
              />
            </button>
            <button 
              onClick={toggleBookmark}
              disabled={isUpdatingBookmark}
              className={`p-2 rounded-full hover:bg-surface-light transition-colors mr-2 ${isUpdatingBookmark ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark 
                className={`h-5 w-5 ${bookmarked ? 'text-blue-500' : 'text-gray-400'} ${isUpdatingBookmark ? 'animate-pulse' : ''}`} 
                fill={bookmarked ? 'currentColor' : 'none'} 
              />
            </button>
            <button className="p-2 rounded-full hover:bg-surface-light transition-colors">
              <Share2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-surface rounded-xl overflow-hidden shadow-lg border border-surface-light/20">
              {/* Tab Navigation */}
              <div className="flex border-b border-surface-light">
                <button
                  onClick={() => setActiveTab('episodes')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'episodes' 
                      ? 'text-secondary border-b-2 border-secondary' 
                      : 'text-white hover:text-secondary'
                  }`}
                >
                  {t('anime.episodes')}
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'info' 
                      ? 'text-secondary border-b-2 border-secondary' 
                      : 'text-white hover:text-secondary'
                  }`}
                >
                  {t('anime.info')}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'episodes' ? (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-surface-dark">
                    {hasEpisodesData && episodesData.seasons[selectedSeason.name] ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        {Object.entries(episodesData.seasons[selectedSeason.name])
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([episodeNum, episodeData]) => (
                            <motion.button
                              key={episodeNum}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setSelectedEpisode(Number(episodeNum) - 1)}
                              className={`w-full p-4 rounded-lg text-white transition-all flex items-center justify-between group ${
                                selectedEpisode === Number(episodeNum) - 1 
                                  ? 'bg-gradient-to-r from-primary/30 to-secondary/30 border-l-4 border-secondary shadow-md' 
                                  : 'bg-surface-dark hover:bg-surface-light'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`rounded-full p-1.5 ${
                                  selectedEpisode === Number(episodeNum) - 1
                                    ? 'bg-secondary text-black'
                                    : 'bg-surface-light text-primary group-hover:bg-primary/20'
                                } transition-colors`}>
                                  <Play className="h-3 w-3" />
                                </div>
                                <div className="text-left">
                                  <span className={`block ${selectedEpisode === Number(episodeNum) - 1 ? 'font-medium' : ''}`}>
                                    {t('anime.episode')} {episodeNum}
                                  </span>
                                  {episodeData.title !== `Episode ${episodeNum}` && (
                                    <span className="block text-gray-400 text-xs mt-0.5 truncate max-w-[180px]">
                                      {episodeData.title}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {(episodeData as any).duration && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {(episodeData as any).duration}
                                </span>
                              )}
                            </motion.button>
                          ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">{loadingEpisodes ? t('common.loading') : t('anime.noEpisodesAvailable')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 text-gray-300"
                  >
                    <div>
                      <h3 className="text-white font-medium mb-2">{t('anime.synopsis')}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{anime.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('anime.status')}:</span>
                        <span className="text-white">{anime.status || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('anime.studios')}:</span>
                        <span className="text-white">{(anime as any).studio || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('anime.aired')}:</span>
                        <span className="text-white">{(anime as any).year || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('anime.duration')}:</span>
                        <span className="text-white">{(anime as any).episodeDuration || '24 min'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('anime.rating')}:</span>
                        <span className="text-white">{(anime as any).ageRating || 'PG-13'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1">
            <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-surface-light/20">
              {/* Language selection bar */}
              {selectedEpisode !== null && availableLanguages.length > 0 && (
                <div className="bg-surface-dark p-3 flex justify-between items-center border-b border-gray-800">
                  <div className="text-white font-medium">
                    {t('anime.episode')} {selectedEpisode + 1}: {currentEpisode?.title || ''}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{t('common.language')}:</span>
                    <div className="flex space-x-2">
                      {availableLanguages.includes('en') && (
                        <button
                          onClick={() => handleLanguageChange('en')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            selectedLanguage === 'en' 
                              ? 'bg-primary text-white' 
                              : 'bg-surface-light text-gray-300 hover:bg-primary/30'
                          }`}
                        >
                          🇬🇧 English
                        </button>
                      )}
                      {availableLanguages.includes('tr') && (
                        <button
                          onClick={() => handleLanguageChange('tr')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            selectedLanguage === 'tr' 
                              ? 'bg-primary text-white' 
                              : 'bg-surface-light text-gray-300 hover:bg-primary/30'
                          }`}
                        >
                          🇹🇷 Türkçe
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="aspect-video bg-black">
                  {selectedEpisode !== null ? (
                    embedCode ? (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: embedCode }} />
                    ) : (
                      <div className="flex items-center justify-center h-full flex-col">
                        <Play className="h-16 w-16 text-secondary mx-auto mb-4 animate-pulse" />
                        <p className="text-gray-400">
                          {availableLanguages.length > 0 
                            ? t('anime.loadingVideo') 
                            : `${t('anime.episode')} ${selectedEpisode + 1} ${t('common.error')}`}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full flex-col">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-gray-600 mx-auto opacity-50 mb-3" />
                        <p className="text-gray-400 text-lg">{t('anime.selectEpisode')}</p>
                        <p className="text-gray-500 text-sm mt-2">{t('anime.enjoyYourShow')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Episode navigation buttons */}
                {selectedEpisode !== null && (
                  <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                    <button
                      onClick={() => navigateToEpisode('prev')}
                      disabled={selectedEpisode <= 0}
                      className={`p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary transition-colors pointer-events-auto ${
                        selectedEpisode <= 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => navigateToEpisode('next')}
                      disabled={!hasEpisodesData || selectedEpisode >= Object.keys(episodesData!.seasons[selectedSeason.name]).length - 1}
                      className={`p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary transition-colors pointer-events-auto ${
                        !hasEpisodesData || selectedEpisode >= Object.keys(episodesData!.seasons[selectedSeason.name]).length - 1 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Episode info */}
              {currentEpisode && (
                <div className="p-6 border-t border-surface-light/20">
                  <h2 className="text-xl font-bold text-white mb-3">{t('anime.episode')} {selectedEpisode! + 1}: {currentEpisode.title}</h2>
                  <p className="text-gray-400 leading-relaxed text-sm">{(currentEpisode as any).description || anime.description}</p>
                  
                  {(currentEpisode as any).airDate && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{t('anime.airDate')}: {(currentEpisode as any).airDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Comments section placeholder */}
            <div className="mt-6 bg-surface rounded-xl p-6 shadow-lg border border-surface-light/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {t('anime.comments')}
              </h3>
              <div className="text-center py-8">
                <p className="text-gray-400">{t('common.comingSoon')}</p>
              </div>
            </div>
          </div>

          {/* Streaming Servers */}
          <div className="w-full lg:w-1/4">
            <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-surface-light/20">
              <h2 className="text-xl font-bold text-white p-6 border-b border-surface-light flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                {t('anime.streamingServers')}
              </h2>
              <div className="divide-y divide-surface-light">
                {['EarnVids', 'StreamHG', 'listeamed', 'upshare', 'VK', 'luluvdo', 'ok', 'vid1sha'].map((server) => (
                  <motion.button
                    key={server}
                    whileHover={{ x: 5 }}
                    className="w-full p-4 text-left hover:bg-surface-light transition-colors flex items-center justify-between group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">{server}</span>
                    <div className="bg-surface-light group-hover:bg-primary rounded-full p-1.5 transition-colors">
                      <Play className="h-3 w-3 text-white" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Related Anime */}
            <div className="mt-6 bg-surface rounded-xl shadow-lg overflow-hidden border border-surface-light/20">
              <h2 className="text-xl font-bold text-white p-6 border-b border-surface-light">
                {t('anime.relatedAnime')}
              </h2>
              <div className="p-4 space-y-4">
                {(anime as any).related ? (
                  (anime as any).related.map((relatedAnime: any, index: number) => (
                    <div key={index} className="flex gap-3 group cursor-pointer">
                      <img 
                        src={relatedAnime.image || 'https://via.placeholder.com/80x120?text=No+Image'} 
                        alt={relatedAnime.title} 
                        className="w-14 h-20 object-cover rounded-md group-hover:ring-2 ring-primary transition-all"
                      />
                      <div>
                        <h4 className="text-white font-medium group-hover:text-primary transition-colors">{relatedAnime.title}</h4>
                        <p className="text-xs text-gray-400">{relatedAnime.relation}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                          <span className="text-xs text-gray-400">{relatedAnime.rating || '?'}/10</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">{t('anime.noRelatedAnime')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeSeasonPage;