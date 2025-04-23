import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { Anime } from '../../types';

interface AnimeCardProps {
  anime: Anime;
  featured?: boolean;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, featured = false }) => {
  return (
    <Link to={`/anime/${anime.id}`} className={`card group ${featured ? 'h-80' : 'h-72'}`}>
      <div className="relative h-full">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={anime.coverImage} 
            alt={anime.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center mb-2 space-x-2">
            {anime.genres.slice(0, 2).map((genre, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 text-xs rounded-full bg-primary/30 text-gray-200"
              >
                {genre}
              </span>
            ))}
            <div className="flex items-center ml-auto text-xs space-x-1 text-secondary">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              <span>{anime.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <h3 className="text-white font-bold text-lg truncate">{anime.title}</h3>
          
          {featured && (
            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
              {anime.description}
            </p>
          )}
          
          <div className="flex items-center mt-3 justify-between">
            <span className="text-gray-400 text-sm">
              {anime.episodes} Episodes
            </span>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="btn-secondary flex items-center space-x-1 py-1 px-3">
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