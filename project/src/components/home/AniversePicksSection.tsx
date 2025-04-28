import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

// Updated AniversePicks to include the top 3 animes with the highest "id" values from animeList.json
const AniversePicks: Anime[] = [
  {
    id: "6",
    title: "jujutsu kaisen",
    coverImage: "https://5.imimg.com/data5/ANDROID/Default/2023/4/298334358/UV/IR/QX/15232517/product-jpeg-500x500.jpg",
    description: "Superheroes in training.",
    episodes: 113,
    genres: ["Action", "Comedy", "Superhero"],
    rating: 8.5,
    releaseYear: 2016,
    status: "Ongoing",
    studio: "Bones"
  },
  {
    id: "5",
    title: "My Hero Academia",
    coverImage: "https://m.media-amazon.com/images/M/MV5BNzgxMzI3NzgtYzE2Zi00MzlmLThlNWEtNWVmZWEyZjNkZWYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    description: "Superheroes in training.",
    episodes: 113,
    genres: ["Action", "Comedy", "Superhero"],
    rating: 8.5,
    releaseYear: 2016,
    status: "Ongoing",
    studio: "Bones"
  },
  {
    id: "4",
    title: "Demon Slayer",
    coverImage: "https://m.media-amazon.com/images/M/MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    description: "A boy fights demons to save his sister.",
    episodes: 26,
    genres: ["Action", "Adventure", "Supernatural"],
    rating: 8.7,
    releaseYear: 2019,
    status: "Ongoing",
    studio: "ufotable"
  }
];

const AniversePicksSection: React.FC = () => {
  return (
    <section className="py-16 bg-background-light">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-orbitron font-bold">
              <span className="accent-gradient-text">Aniverse</span> Picks
            </h2>
            <p className="text-gray-400 mt-2">Staff curated recommendations just for you</p>
          </div>
          
          <Link to="/anime" className="flex items-center space-x-1 text-accent hover:text-accent-light transition-colors">
            <span>Explore more</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AniversePicks.map(anime => (
            <AnimeCard key={anime.id} anime={anime} featured={true} />
          ))}
        </div>
        
        <div className="mt-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl"></div>
          <div className="relative bg-surface-light/50 p-6 rounded-xl backdrop-blur">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-orbitron font-bold text-white">Join Aniverse Premium</h3>
                <p className="text-gray-300 mt-2">Enjoy ad-free streaming, exclusive content, and early access to new releases.</p>
              </div>
              
              <Link to="/premium" className="btn-accent py-3 px-6">
                Get Premium
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AniversePicksSection;