import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<{ season: number; episodes: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) {
        setError('Invalid URL. Redirecting to anime directory...');
        setTimeout(() => navigate('/anime'), 2000);
        return;
      }

      try {
        setIsLoading(true);
        const animeDoc = doc(db, 'anime', id);
        const animeSnapshot = await getDoc(animeDoc);
        
        if (animeSnapshot.exists()) {
          const animeData = { ...animeSnapshot.data(), id: animeSnapshot.id } as Anime;
          setAnime(animeData);

          const totalSeasons = animeData.seasons || 1;
          const allEpisodes = [];
          for (let season = 1; season <= totalSeasons; season++) {
            allEpisodes.push({
              season,
              episodes: Array.from({ length: animeData.episodesPerSeason || 12 }, (_, i) => `Season ${season} Episode ${i + 1}`),
            });
          }
          setEpisodes(allEpisodes);
          setError(null);
        } else {
          setError('Anime not found. Redirecting to anime directory...');
          setTimeout(() => navigate('/anime'), 2000);
        }
      } catch (error) {
        setError('Error loading anime details. Please try again later.');
        console.error('Error fetching anime:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnime();
  }, [id, navigate]);

  const handleSeasonSelect = (season: number) => {
    setSelectedSeason(season);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-96 w-64 bg-surface-light rounded-lg mb-4 mx-auto"></div>
            <div className="h-8 bg-surface-light rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-surface-light rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">{error}</div>
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

  if (!anime) {
    return null;
  }

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
          <ul className="space-y-2">
            {episodes
              .find((seasonData) => seasonData.season === selectedSeason)?.episodes.map((episode, index) => (
                <li
                  key={index}
                  className="bg-surface-light p-4 rounded-lg text-white shadow-md hover:bg-surface"
                >
                  {episode}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;