import React, { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Anime } from '../../types';

// Default featured anime in case of Firestore errors
const DEFAULT_FEATURED_ANIME: Anime[] = [
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-979nF72r4JVR.jpg",
    bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
    genres: ["Action", "Drama", "Supernatural"],
    releaseYear: 2020,
    status: "Completed",
    rating: 8.7,
    episodes: 24,
    studio: "MAPPA"
  },
  {
    id: "my-hero-academia",
    title: "My Hero Academia",
    description: "In a world where people with superpowers (known as 'Quirks') are the norm, Izuku Midoriya has dreams of one day becoming a Hero, despite being bullied by his classmates for not having a Quirk.",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-DUKLgasrgeNO.jpg",
    bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg",
    genres: ["Action", "Comedy", "Superhero"],
    releaseYear: 2016,
    status: "Ongoing",
    rating: 8.3,
    episodes: 113,
    studio: "Bones"
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
    bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg",
    genres: ["Action", "Fantasy", "Historical"],
    releaseYear: 2019,
    status: "Ongoing",
    rating: 8.9,
    episodes: 44,
    studio: "ufotable"
  },
  {
    id: "one-piece",
    title: "One Piece",
    description: "Gol D. Roger was known as the 'Pirate King,' the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world.",
    coverImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y20PIL9.jpg",
    bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg",
    genres: ["Action", "Adventure", "Fantasy"],
    releaseYear: 1999,
    status: "Ongoing",
    rating: 8.8,
    episodes: 1000,
    studio: "Toei Animation"
  }
];

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
        
        // If we found featured anime in Firestore, use them
        if (featuredAnime.length > 0) {
          setLatestAnime(featuredAnime);
        } else {
          // Otherwise use default anime data
          console.log("No featured anime found in Firestore, using default data");
          setLatestAnime(DEFAULT_FEATURED_ANIME);
        }
      } catch (error) {
        console.error('Error fetching featured anime:', error);
        // Use default anime data in case of error
        setLatestAnime(DEFAULT_FEATURED_ANIME);
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
    <section className="relative h-[85vh] overflow-hidden">
      {/* Animated particles background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute h-2 w-2 bg-primary/50 rounded-full top-1/4 left-1/4 animate-pulse-slow"></div>
        <div className="absolute h-3 w-3 bg-secondary/50 rounded-full top-1/3 left-2/3 animate-pulse"></div>
        <div className="absolute h-2 w-2 bg-accent/50 rounded-full top-2/3 left-1/5 animate-pulse-slow"></div>
        <div className="absolute h-2 w-2 bg-primary/50 rounded-full top-1/2 left-3/4 animate-float"></div>
      </div>

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
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={anime.bannerImage || anime.coverImage}
                alt={anime.title}
                className="absolute inset-0 w-full h-full object-cover transform scale-110 transition-transform duration-10000 ease-in-out"
                style={{ 
                  transform: index === activeIndex ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 6s ease-in-out'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl pt-16">
          {latestAnime.map((anime, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                index === activeIndex
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8 absolute pointer-events-none'
              }`}
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {anime.genres?.slice(0, 3).map((genre: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full bg-primary/30 text-white backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold mb-6">
                <span className="text-white">{anime.title.split(' ')[0]}</span>
                <span className="gradient-text"> {anime.title.split(' ').slice(1).join(' ')}</span>
              </h1>

              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                {anime.description?.substring(0, 150)}
                {anime.description && anime.description.length > 150 ? '...' : ''}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleWatchNowClick(anime)}
                  className="btn-primary flex items-center space-x-2 py-3 px-6 hover:scale-105 transition-transform"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Now</span>
                </button>

                <Link
                  to={`/anime/${anime.id}`}
                  className="btn-ghost flex items-center space-x-2 py-3 px-6 hover:bg-white/5 transition-colors"
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
            className={`h-3 rounded-full transition-all ${
              index === activeIndex
                ? 'bg-secondary w-10'
                : 'bg-gray-500/50 w-3 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;