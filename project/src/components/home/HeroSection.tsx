import React, { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeaturedAnime {
  id: number;
  title: string;
  description: string;
  image: string;
  genres: string[];
}

const featuredAnime: FeaturedAnime[] = [
  {
    id: 1,
    title: "Celestial Legends: The Awakening",
    description: "A forgotten prophecy. A reluctant hero. As ancient powers reawaken, Hiro must embrace his hidden destiny to prevent the world from falling into darkness.",
    image: "https://images.pexels.com/photos/3732475/pexels-photo-3732475.jpeg",
    genres: ["Fantasy", "Action", "Adventure"]
  },
  {
    id: 2,
    title: "Cyber Nexus 2099",
    description: "In a dystopian future where humanity and technology have merged, a rogue AI threatens to enslave mankind. Only a group of enhanced hackers can stop it.",
    image: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg",
    genres: ["Sci-Fi", "Cyberpunk", "Thriller"]
  },
  {
    id: 3,
    title: "Samurai's Honor",
    description: "In feudal Japan, a masterless samurai seeks redemption by protecting a village from ruthless bandits, discovering purpose and honor in the process.",
    image: "https://images.pexels.com/photos/5486845/pexels-photo-5486845.jpeg",
    genres: ["Historical", "Martial Arts", "Drama"]
  }
];

const HeroSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentAnime = featuredAnime[activeIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % featuredAnime.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        {featuredAnime.map((anime, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ zIndex: index === activeIndex ? 1 : 0 }}
          >
            <img 
              src={anime.image} 
              alt={anime.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent opacity-90"></div>
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          {featuredAnime.map((anime, index) => (
            <div 
              key={index}
              className={`transition-all duration-1000 ${
                index === activeIndex 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8 absolute pointer-events-none'
              }`}
            >
              <div className="flex space-x-2 mb-4">
                {anime.genres.map((genre, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 text-xs rounded-full bg-primary/40 text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold text-white mb-4">
                {anime.title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                {anime.description}
              </p>
              
              <div className="flex space-x-4">
                <Link 
                  to={`/anime/${anime.id}`} 
                  className="btn-primary flex items-center space-x-2 py-3 px-6"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Now</span>
                </Link>
                
                <Link 
                  to={`/anime/${anime.id}`} 
                  className="btn-ghost flex items-center space-x-2 py-3 px-6"
                >
                  <Info className="h-5 w-5" />
                  <span>More Info</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center space-x-2">
        {featuredAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex 
                ? 'bg-secondary w-10' 
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;