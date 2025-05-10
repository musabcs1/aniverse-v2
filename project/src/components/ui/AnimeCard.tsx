import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, Play } from 'lucide-react';
import { Anime } from '../../types';

// Simple fallback image
const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFuaW1lPC90ZXh0Pjwvc3ZnPg==";

interface AnimeCardProps {
  anime: Anime;
  featured?: boolean;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, featured = false }) => {
  if (!anime) return null;

  return (
    <Link to={`/anime/${anime.id}`} className={`card group ${featured ? 'h-80' : 'h-72'}`}>
      <div className="relative h-full w-full">
        {/* Background color as base */}
        <div className="absolute inset-0 bg-surface-dark"></div>
        
        {/* Image with error handling */}
        <div 
          className="absolute inset-0 bg-center bg-cover"
          style={{ 
            backgroundImage: `url(${anime.coverImage || FALLBACK_IMAGE})`,
            backgroundSize: 'cover'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90"></div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="flex items-center mb-2 space-x-2">
            {anime.genres && anime.genres.length > 0 ? anime.genres.slice(0, 2).map((genre, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 text-xs rounded-full bg-primary/30 text-gray-200"
              >
                {genre}
              </span>
            )) : (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/30 text-gray-200">
                Unknown
              </span>
            )}
            <div className="flex items-center ml-auto text-xs space-x-1 text-secondary">
              <StarIcon className="h-3 w-3 fill-secondary text-blue-500" />
              <span>{anime.rating ? anime.rating.toFixed(1) : 'N/A'}</span>
            </div>
          </div>
          
          <h3 className="text-white font-bold text-lg truncate">{anime.title || 'Untitled Anime'}</h3>
          
          {featured && (
            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
              {anime.description || 'No description available.'}
            </p>
          )}
          
          <div className="flex items-center mt-3 justify-between">
            <span className="text-gray-400 text-sm">
              {anime.episodes || 0} Episodes
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