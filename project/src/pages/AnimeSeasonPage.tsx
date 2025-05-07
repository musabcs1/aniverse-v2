import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Anime, AnimeEpisodes } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from '../components/layout/Header';

const AnimeSeasonPage: React.FC = () => {
  const navigate = useNavigate();
  const { animeId, seasonName } = useParams<{ animeId: string; seasonName: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodesData, setEpisodesData] = useState<AnimeEpisodes | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [embedCode, setEmbedCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const { t, i18n } = useTranslation();

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

  return (
    <div className="min-h-screen bg-background">
      <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Episodes List */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-surface rounded-xl overflow-hidden shadow-lg">
              <button
                className="w-full bg-primary hover:bg-primary-dark py-3 text-center text-white font-medium transition-colors"
                onClick={() => navigate(-1)}
              >
                {t('anime.backToDetails')}
              </button>
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">{selectedSeason.name}</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-surface-dark">
                  {hasEpisodesData && episodesData.seasons[selectedSeason.name] ? (
                    <>
                      {selectedEpisode !== null && selectedEpisode > 0 && (
                        <button
                          onClick={() => setSelectedEpisode(selectedEpisode - 1)}
                          className="w-full p-4 rounded-lg text-white transition-all flex items-center justify-between bg-surface-dark hover:bg-surface-light mb-4"
                        >
                          <div className="flex items-center gap-3">
                            <Play className="h-5 w-5 text-primary group-hover:text-secondary transition-colors" />
                            <span>Previous Episode</span>
                          </div>
                        </button>
                      )}
                      {Object.entries(episodesData.seasons[selectedSeason.name])
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([episodeNum, episodeData]) => (
                          <button
                            key={episodeNum}
                            onClick={() => setSelectedEpisode(Number(episodeNum) - 1)}
                            className={`w-full p-4 rounded-lg text-white transition-all flex items-center justify-between group ${
                              selectedEpisode === Number(episodeNum) - 1 
                                ? 'bg-surface-light border-l-4 border-secondary' 
                                : 'bg-surface-dark hover:bg-surface-light'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Play className={`h-5 w-5 ${
                                selectedEpisode === Number(episodeNum) - 1 ? 'text-secondary' : 'text-primary group-hover:text-secondary'
                              } transition-colors`} />
                              <span className={selectedEpisode === Number(episodeNum) - 1 ? 'font-medium' : ''}>
                                {t('anime.episode')} {episodeNum}
                                {episodeData.title !== `Episode ${episodeNum}` && (
                                  <span className="ml-2 text-gray-400 text-sm">
                                    - {episodeData.title}
                                  </span>
                                )}
                              </span>
                            </div>
                          </button>
                        ))}
                      {selectedEpisode !== null && selectedEpisode < Object.keys(episodesData.seasons[selectedSeason.name]).length - 1 && (
                        <button
                          onClick={() => setSelectedEpisode(selectedEpisode + 1)}
                          className="w-full p-4 rounded-lg text-white transition-all flex items-center justify-between bg-surface-dark hover:bg-surface-light mt-4"
                        >
                          <div className="flex items-center gap-3">
                            <Play className="h-5 w-5 text-primary group-hover:text-secondary transition-colors" />
                            <span>Next Episode</span>
                          </div>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">{t('anime.noEpisodesAvailable')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1">
            <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
              {/* Language selection bar */}
              {selectedEpisode !== null && availableLanguages.length > 0 && (
                <div className="bg-surface-dark p-3 flex justify-center items-center space-x-4 border-b border-gray-800">
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
              )}

              <div className="aspect-video bg-black rounded-t-xl mb-6">
                {selectedEpisode !== null ? (
                  embedCode ? (
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: embedCode }} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-16 w-16 text-secondary mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-400">
                        {availableLanguages.length > 0 
                          ? t('anime.noEpisodesAvailable') 
                          : `${t('anime.episode')} ${selectedEpisode + 1} ${t('common.error')}`}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 mb-2">{t('anime.selectEpisode')}</p>
                    <Play className="h-12 w-12 text-gray-600 mx-auto opacity-50" />
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">{t('anime.about')} {anime.title}</h2>
                <p className="text-gray-400 leading-relaxed">{anime.description}</p>
              </div>
            </div>
          </div>

          {/* Streaming Servers */}
          <div className="w-full lg:w-1/4">
            <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
              <h2 className="text-xl font-bold text-white p-6 border-b border-surface-light">
                {t('anime.streamingServers')}
              </h2>
              <div className="divide-y divide-surface-light">
                {['EarnVids', 'StreamHG', 'listeamed', 'upshare', 'VK', 'luluvdo', 'ok', 'vid1sha'].map((server) => (
                  <button
                    key={server}
                    className="w-full p-4 text-left hover:bg-surface-light transition-colors flex items-center justify-between group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">{server}</span>
                    <Play className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeSeasonPage;