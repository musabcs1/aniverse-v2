import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<string[]>([]);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) {
        console.error('No ID provided in the URL.');
        return;
      }
      console.log('Fetching anime with ID:', id);
      try {
        const animeDoc = await getDoc(doc(db, 'anime', id));
        if (animeDoc.exists()) {
          console.log('Fetched anime data:', animeDoc.data());
          setAnime(animeDoc.data() as Anime);
          setEpisodes(["Episode 1", "Episode 2", "Episode 3"]); // Simulated episodes
        } else {
          console.error('No anime found with the provided ID.');
        }
      } catch (error) {
        console.error('Error fetching anime:', error);
      }
    };

    fetchAnime();
  }, [id]);

  const handleSeasonSelect = (season: number) => {
    setSelectedSeason(season);
    // Simulate fetching episodes for the selected season
    setEpisodes([`Season ${season} Episode 1`, `Season ${season} Episode 2`, `Season ${season} Episode 3`]);
  };

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
            {[1, 2, 3].map((season) => (
              <button
                key={season}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedSeason === season ? 'bg-secondary' : 'bg-surface-light hover:bg-surface'
                }`}
                onClick={() => handleSeasonSelect(season)}
              >
                Season {season}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Episodes</h2>
          <ul className="space-y-2">
            {episodes.map((episode, index) => (
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