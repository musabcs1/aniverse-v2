import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

// Updated AniNestPicks to include the top 3 animes with the highest "id" values from animeList.json
const AniNestPicks: Anime[] = [
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/1964/116831.jpg",
    episodes: 24,
    rating: 8.7,
    releaseYear: 2020,
    genres: ["Action", "Fantasy", "School", "Shounen", "Supernatural"],
    status: "Completed",
    studio: "MAPPA",
    seasons: [
      { name: "Season 1", episodes: 24 }
    ]
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    episodes: 26,
    rating: 8.9,
    releaseYear: 2019,
    genres: ["Action", "Fantasy", "Historical", "Shounen", "Supernatural"],
    status: "Completed",
    studio: "ufotable",
    seasons: [
      { name: "Season 1", episodes: 26 }
    ]
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    description: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    bannerImage: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    episodes: 25,
    rating: 8.5,
    releaseYear: 2013,
    genres: ["Action", "Drama", "Fantasy", "Shounen", "Supernatural"],
    status: "Completed",
    studio: "Wit Studio",
    seasons: [
      { name: "Season 1", episodes: 25 }
    ]
  }
];

const AniNestPicksSection: React.FC = () => {
  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white">
            <span className="accent-gradient-text">AniNest</span> Picks
          </h2>
          <Link to="/anime" className="btn-ghost flex items-center space-x-2 py-2 px-4">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AniNestPicks.map(anime => (
            <AnimeCard key={anime.id} anime={anime} featured />
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-orbitron font-bold text-white">Join AniNest Premium</h3>
              <p className="text-gray-300 mt-2 max-w-xl">
                Get unlimited access to all episodes, ad-free viewing, and exclusive content.
              </p>
            </div>
            <Link to="/premium" className="btn-primary py-3 px-8">
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AniNestPicksSection;