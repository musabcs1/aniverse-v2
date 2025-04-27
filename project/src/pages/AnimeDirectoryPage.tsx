import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/outline'; // Replaced invalid imports with valid icons from Heroicons
import animeList from '../../api/animeList.json';
import AnimeCard from '../components/ui/AnimeCard';
import { Anime } from '../types';

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Historical", 
  "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Racing", "Cyberpunk", "School", "Martial Arts"
];

const years = [2025, 2024, 2023, 2022, 2021];
const studios = ["All Studios", "Aniverse Studios", "NeoCyber Productions", "Shogun Animation", "Phantom Works", "Digital Frontier", "Chrono Visuals"];
const status = ["All", "Ongoing", "Completed", "Upcoming"];

const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

const AnimeDirectoryPage: React.FC = () => {
  const [animeListState] = useState<Anime[]>(animeList.map(anime => ({
    ...anime,
    status: anime.status as 'Completed' | 'Ongoing' | 'Upcoming',
  })));
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStudio, setSelectedStudio] = useState("All Studios");
  const [sortBy, setSortBy] = useState("newest");

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedYear(null);
    setSelectedStatus("All");
    setSelectedStudio("All Studios");
    setSortBy("newest");
  };

  // Filter logic
  const filteredAnime = animeListState.filter(anime => {
    // Search term filter
    if (searchTerm && !anime.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Genre filter
    if (selectedGenres.length > 0 && !anime.genres.some(genre => selectedGenres.includes(genre))) {
      return false;
    }
    
    // Year filter
    if (selectedYear && anime.releaseYear !== selectedYear) {
      return false;
    }
    
    // Status filter
    if (selectedStatus !== "All" && anime.status !== selectedStatus) {
      return false;
    }
    
    // Studio filter
    if (selectedStudio !== "All Studios" && anime.studio !== selectedStudio) {
      return false;
    }
    
    return true;
  });

  // Sort logic
  const sortedAnime = [...filteredAnime].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.releaseYear - a.releaseYear;
      case "oldest":
        return a.releaseYear - b.releaseYear;
      case "rating":
        return b.rating - a.rating;
      case "a-z":
        return a.title.localeCompare(b.title);
      case "z-a":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-orbitron font-bold mb-8">
          <span className="gradient-text">Anime</span> Directory
        </h1>
        
        {/* Search and Filters Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search anime..." 
                className="w-full bg-surface py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button 
              className="btn-ghost flex items-center justify-center space-x-2"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
            </button>
            
            <select 
              className="bg-surface py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
          
          {/* Expanded Filters */}
          {filtersVisible && (
            <div className="mt-6 p-6 bg-surface rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 15).map(genre => (
                      <button 
                        key={genre}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedGenres.includes(genre) 
                            ? 'bg-primary text-white' 
                            : 'bg-surface-light text-gray-300 hover:bg-surface-light'
                        }`}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Year</h3>
                  <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                      <button 
                        key={year}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedYear === year 
                            ? 'bg-primary text-white' 
                            : 'bg-surface-light text-gray-300 hover:bg-surface-light'
                        }`}
                        onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Status</h3>
                  <select 
                    className="w-full bg-surface-light py-2 px-3 rounded-lg"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {status.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Studio</h3>
                  <select 
                    className="w-full bg-surface-light py-2 px-3 rounded-lg"
                    value={selectedStudio}
                    onChange={(e) => setSelectedStudio(e.target.value)}
                  >
                    {studios.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  className="btn-ghost mr-3"
                  onClick={resetFilters}
                >
                  Reset
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => setFiltersVisible(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          Showing {sortedAnime.length} of {animeListState.length} titles
        </div>
        
        {/* Anime Grid */}
        {sortedAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {sortedAnime.map(anime => (
              <Link to={`/anime/${generateSlug(anime.title)}`} key={anime.id}>
                <AnimeCard anime={anime} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No anime found matching your criteria</p>
            <button 
              className="btn-primary mt-4"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDirectoryPage;