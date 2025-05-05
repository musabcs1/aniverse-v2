import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { Anime } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from '../components/layout/Header';

const AnimeSeasonPage: React.FC = () => {
  const navigate = useNavigate();
  const { animeId, seasonName } = useParams<{ animeId: string; seasonName: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const { data: anime, isLoading, error } = useQuery<Anime>({
    queryKey: ['anime', animeId],
    queryFn: async () => {
      const docRef = doc(db, 'anime', animeId!);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Anime not found');
      return docSnap.data() as Anime;
    }
  });

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
            Back to Anime Details
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
          <div className="text-red-500 mb-4">No seasons available for this anime</div>
          <button 
            onClick={() => navigate(-1)}
            className="btn-primary py-2 px-6"
          >
            Back to Anime Details
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
          <div className="text-red-500 mb-4">Season not found</div>
          <button 
            onClick={() => navigate(-1)}
            className="btn-primary py-2 px-6"
          >
            Back to Anime Details
          </button>
        </div>
      </div>
    );
  }

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
                Back to Details
              </button>
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">{selectedSeason.name}</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-surface-dark">
                  {Array.from({ length: selectedSeason.episodes }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedEpisode(i)}
                      className={`w-full p-4 rounded-lg text-white transition-all flex items-center justify-between group ${
                        selectedEpisode === i 
                          ? 'bg-surface-light border-l-4 border-secondary' 
                          : 'bg-surface-dark hover:bg-surface-light'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className={`h-5 w-5 ${
                          selectedEpisode === i ? 'text-secondary' : 'text-primary group-hover:text-secondary'
                        } transition-colors`} />
                        <span className={selectedEpisode === i ? 'font-medium' : ''}>
                          Episode {i + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1">
            <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
              <div className="aspect-video bg-black rounded-t-xl mb-6 flex items-center justify-center">
                {selectedEpisode !== null ? (
                  <div className="text-center">
                    <Play className="h-16 w-16 text-secondary mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-400">Playing Episode {selectedEpisode + 1}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Select an episode to start watching</p>
                    <Play className="h-12 w-12 text-gray-600 mx-auto opacity-50" />
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">About {anime.title}</h2>
                <p className="text-gray-400 leading-relaxed">{anime.description}</p>
              </div>
            </div>
          </div>

          {/* Streaming Servers */}
          <div className="w-full lg:w-1/4">
            <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
              <h2 className="text-xl font-bold text-white p-6 border-b border-surface-light">
                Streaming Servers
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