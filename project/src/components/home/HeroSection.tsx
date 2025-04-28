import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const latestAnime = [
  {
    id: "6",
    title: "hm Hero Academia",
    bannerImage:"https://static1.cbrimages.com/wordpress/wp-content/uploads/2021/03/my-hero-academia-banner.jpg?q=70&fit=contain&w=1200&h=628&dpr=1",
    coverImage: "https://m.media-amazon.com/images/M/MV5BNzgxMzI3NzgtYzE2Zi00MzlmLThlNWEtNWVmZWEyZjNkZWYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    description: "Superheroes in training.",
    genres: ["Action", "Comedy", "Superhero"],
    rating: 8.5,
    releaseYear: 2016,
    status: "Ongoing",
    studio: "Bones",
  },
];

const HeroSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        {latestAnime.map((anime, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ zIndex: index === activeIndex ? 1 : 0 }}
          >
            <img
              src={anime.coverImage}
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
          {latestAnime.map((anime, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                index === activeIndex
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8 absolute pointer-events-none'
              }`}
            >
              <div className="flex space-x-2 mb-4">
                {anime.genres.map((genre: string, i: number) => (
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
        {latestAnime.map((_, index) => (
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