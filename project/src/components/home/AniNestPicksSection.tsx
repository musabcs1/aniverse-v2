import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
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
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10"></div>
      <div className="absolute inset-0 bg-surface/50"></div>
      <div className="absolute -left-40 top-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -right-40 bottom-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block mb-2 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-primary-light">
              FEATURED SELECTION
            </div>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              <span className="accent-gradient-text">AniNest</span> Picks
            </h2>
            <p className="text-gray-400 mt-2 max-w-lg">
              Our curated selection of must-watch anime series that define the medium
            </p>
          </div>
          
          <Link 
            to="/anime" 
            className="group flex items-center space-x-2 py-2 px-4 border border-primary/30 rounded-full hover:bg-primary/10 transition-all"
          >
            <span className="text-white group-hover:text-primary transition-colors">View All Series</span>
            <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {AniNestPicks.map((anime, index) => (
            <div key={anime.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity"></div>
              <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                <AnimeCard anime={anime} featured />
              </div>
              <div className="absolute -bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 group-hover:bottom-2 transition-all duration-300">
                <div className="flex items-center space-x-1 bg-surface px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-primary/20">
                  <Star className="h-3 w-3 fill-secondary text-secondary" />
                  <span className="text-secondary">{anime.rating.toFixed(1)}</span>
                  <span className="text-gray-400">• {anime.episodes} Episodes</span>
                  <span className="text-gray-400">• {anime.releaseYear}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AniNestPicksSection;