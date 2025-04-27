import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<{ season: number; episodes: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) {
        setError('No ID provided in the URL.');
        return;
      }

      const formattedId = id.replace(/-/g, ' '); // Replace '-' with spaces to match anime titles

      try {
        const animeQuery = query(
          collection(db, 'anime'),
          where('title', '==', formattedId)
        );
        const querySnapshot = await getDocs(animeQuery);
        if (!querySnapshot.empty) {
          const animeData = querySnapshot.docs[0].data() as Anime;
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
        } else {
          setError('No anime found with the provided title.');
        }
      } catch (error) {
        setError('Error fetching anime data. Please try again later.');
        console.error('Error fetching anime:', error);
      }
    };

    fetchAnime();
  }, [id]);

  const handleSeasonSelect = (season: number) => {
    setSelectedSeason(season);
  };

  if (error) {
    return <div className="pt-24 pb-16 text-center text-red-500">{error}</div>;
  }

  if (!anime) {
    return <div className="pt-24 pb-16 text-center">Loading...</div>;
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