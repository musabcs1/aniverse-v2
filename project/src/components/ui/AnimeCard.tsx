import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, Play } from 'lucide-react';
import { Anime } from '../../types';

interface AnimeCardProps {
  anime: Anime;
  featured?: boolean;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, featured = false }) => {
  return (
    <Link to={`/anime/${anime.id}`} className={`card group ${featured ? 'h-80' : 'h-72'} border border-red-800/50`}>
      <div className="relative h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 opacity-70 z-10"></div>
        
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={anime.coverImage} 
            alt={anime.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-red-950/30 opacity-90"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center mb-2 space-x-2">
            {anime.genres.slice(0, 2).map((genre, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 text-xs rounded-full bg-red-700/50 text-red-100"
              >
                {genre}
              </span>
            ))}
            <div className="flex items-center ml-auto text-xs space-x-1 text-red-300">
              <StarIcon className="h-3 w-3 fill-red-300" />
              <span>{anime.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <h3 className="text-red-100 font-bold text-lg truncate group-hover:text-red-300 transition-colors">{anime.title}</h3>
          
          {featured && (
            <p className="text-red-200 text-sm mt-1 line-clamp-2">
              {anime.description}
            </p>
          )}
          
          <div className="flex items-center mt-3 justify-between">
            <span className="text-red-300 text-sm">
              {anime.episodes} Episodes
            </span>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1 py-1 px-3 rounded-md">
                <Play className="h-4 w-4" />
                <span className="text-xs font-medium">Watch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;