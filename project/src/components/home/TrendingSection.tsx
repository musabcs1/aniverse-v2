import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

// Sample data
const trendingAnime: Anime[] = [
  {
    id: 1,
    title: "My Hero Academia",
    coverImage: "https://m.media-amazon.com/images/M/MV5BNzgxMzI3NzgtYzE2Zi00MzlmLThlNWEtNWVmZWEyZjNkZWYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    description: "A forgotten prophecy. A reluctant hero. As ancient powers reawaken, Hiro must embrace his hidden destiny.",
    episodes: 24,
    genres: ["Fantasy", "Action"],
    rating: 9.2,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Aniverse Studios"
  },
  {
    id: 2,
    title: "Jujutsu Kaisen",
    coverImage: "https://cdn.kobo.com/book-images/44717797-1fe9-475e-bca1-fe8aa6d0e7d8/1200/1200/False/jujutsu-kaisen-vol-1.jpg",
    description: "In a dystopian future where humanity and technology have merged, a rogue AI threatens to enslave mankind.",
    episodes: 12,
    genres: ["Sci-Fi", "Cyberpunk"],
    rating: 8.9,
    releaseYear: 2024,
    status: "Ongoing",
    studio: "NeoCyber Productions"
  },
  {
    id: 3,
    title: "Dragon Ball Super",
    coverImage: "https://m.media-amazon.com/images/M/MV5BYTgyMzA5MjEtNDY3Ny00ZDkyLWJhYzEtYzI2Nzk5Mzc3ZDk1XkEyXkFqcGc@._V1_.jpg",
    description: "In feudal Japan, a masterless samurai seeks redemption by protecting a village from ruthless bandits.",
    episodes: 18,
    genres: ["Historical", "Martial Arts"],
    rating: 8.7,
    releaseYear: 2023,
    status: "Completed",
    studio: "Shogun Animation"
  },
  {
    id: 4,
    title: "Naruto",
    coverImage: "https://m.media-amazon.com/images/M/MV5BZTNjOWI0ZTAtOGY1OS00ZGU0LWEyOWYtMjhkYjdlYmVjMDk2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    description: "At an elite academy, students with supernatural abilities train to combat malevolent spirits threatening humanity.",
    episodes: 16,
    genres: ["Supernatural", "Drama"],
    rating: 9.0,
    releaseYear: 2024,
    status: "Ongoing",
    studio: "Phantom Works"
  },
  {
    id: 5,
    title: "One Piece",
    coverImage: "https://m.media-amazon.com/images/I/81rEhhwbubL._AC_UF1000,1000_QL80_.jpg",
    description: "A groundbreaking virtual reality MMORPG becomes a battlefield when players discover they cannot log out.",
    episodes: 24,
    genres: ["Adventure", "Fantasy"],
    rating: 8.8,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Digital Frontier"
  },
  {
    id: 6,
    title: "Echoes of Destiny",
    coverImage: "https://images.pexels.com/photos/1493226/pexels-photo-1493226.jpeg",
    description: "An amnesiac girl discovers she can see glimpses of the future, becoming the key to preventing a global catastrophe.",
    episodes: 22,
    genres: ["Mystery", "Thriller"],
    rating: 9.1,
    releaseYear: 2024,
    status: "Ongoing",
    studio: "Chrono Visuals"
  }
];

const categories = ["All", "Action", "Adventure", "Romance", "Fantasy", "Sci-Fi", "Comedy"];

const TrendingSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const filteredAnime = activeCategory === "All" 
    ? trendingAnime 
    : trendingAnime.filter(anime => anime.genres.includes(activeCategory));

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-orbitron font-bold">
              <span className="gradient-text">Trending</span> Now
            </h2>
            <p className="text-gray-400 mt-2">The hottest anime everyone's watching</p>
          </div>
          
          <Link to="/anime" className="flex items-center space-x-1 text-secondary hover:text-secondary-light transition-colors mt-4 md:mt-0">
            <span>View all</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4 pb-4 mb-6">
          <div className="flex space-x-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`py-2 px-4 rounded-full text-sm transition-all whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-primary text-white' 
                    : 'bg-surface text-gray-300 hover:bg-surface-light'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredAnime.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;