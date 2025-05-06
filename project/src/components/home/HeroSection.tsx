import React, { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Anime } from '../../types';

const HeroSection: React.FC = () => {
  const [latestAnime, setLatestAnime] = useState<Anime[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedAnime = async () => {
      try {
        setLoading(true);
        const animesRef = collection(db, 'anime');
        
        // List of featured anime titles
        const featuredAnimeTitles = [
          "Jujutsu Kaisen",
          "My Hero Academia",
          "Demon Slayer",
          "One Piece"
        ];
        
        // Get all anime and filter for the featured ones
        const q = query(animesRef, limit(50));
        const querySnapshot = await getDocs(q);
        
        const allAnime = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Anime));
        
        // Filter to only include our featured anime and sort them in the specified order
        const featuredAnime = featuredAnimeTitles
          .map(title => {
            // Find anime with exact title or containing the title
            return allAnime.find(anime => 
              anime.title.toLowerCase() === title.toLowerCase() ||
              anime.title.toLowerCase().includes(title.toLowerCase())
            );
          })
          .filter(anime => anime !== undefined) as Anime[];
        
        setLatestAnime(featuredAnime);
      } catch (error) {
        console.error('Error fetching featured anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAnime();
  }, []);

  useEffect(() => {
    if (latestAnime.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % latestAnime.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [latestAnime]);

  const handleWatchNowClick = (anime: Anime) => {
    navigate(`/anime/${anime.id}`);
  };

  if (loading || latestAnime.length === 0) {
    return (
      <section className="relative h-[80vh] overflow-hidden bg-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

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
              src={anime.bannerImage || anime.coverImage}
              alt={anime.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent opacity-90"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-20">
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
                {anime.genres?.map((genre: string, i: number) => (
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

              <div className="flex space-x-4">
                <button
                  onClick={() => handleWatchNowClick(anime)}
                  className="btn-primary flex items-center space-x-2 py-3 px-6"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Now</span>
                </button>

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