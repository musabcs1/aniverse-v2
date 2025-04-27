import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

const TrendingSection: React.FC = () => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      try {
        console.log('Fetching trending anime from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'anime'));
        const fetchedAnime = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Anime[];
        console.log('Fetched trending anime:', fetchedAnime);
        setTrendingAnime(fetchedAnime);
      } catch (error) {
        console.error('Error fetching trending anime:', error);
      }
    };

    fetchTrendingAnime();
  }, []);

  const categories = ["All", "Action", "Adventure", "Romance", "Fantasy", "Sci-Fi", "Comedy"];

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