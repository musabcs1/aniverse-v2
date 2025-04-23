import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

// Sample data
const AniversePicks: Anime[] = [
  {
    id: 7,
    title: "Astral Knights",
    coverImage: "https://images.pexels.com/photos/6771600/pexels-photo-6771600.jpeg",
    description: "Seven legendary warriors from across the galaxy unite to battle an ancient cosmic entity threatening to consume all of creation.",
    episodes: 13,
    genres: ["Space Opera", "Action"],
    rating: 9.5,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Galactic Studios"
  },
  {
    id: 8,
    title: "Garden of Memories",
    coverImage: "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg",
    description: "A beautiful, emotional journey about a girl who can see people's memories by touching the flowers they've grown.",
    episodes: 12,
    genres: ["Drama", "Slice of Life"],
    rating: 9.3,
    releaseYear: 2024,
    status: "Completed",
    studio: "Bloom Animation"
  },
  {
    id: 9,
    title: "Midnight Protocol",
    coverImage: "https://images.pexels.com/photos/2694037/pexels-photo-2694037.jpeg",
    description: "In a world where hackers fight for digital freedom, one brilliant coder discovers a conspiracy that threatens global security.",
    episodes: 24,
    genres: ["Techno-Thriller", "Mystery"],
    rating: 9.0,
    releaseYear: 2023,
    status: "Completed",
    studio: "Dark Code Productions"
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