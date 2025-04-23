import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import AnimeCard from '../components/ui/AnimeCard';
import { Anime } from '../types';

// Sample data - expanded list
const animeList: Anime[] = [
  {
    id: 1,
    title: "Celestial Legends: The Awakening",
    coverImage: "https://www.asialogy.com/wp-content/uploads/anime-nedir-nasil-yapilir.webp",
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
    title: "Cyber Nexus 2099",
    coverImage: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg",
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
    title: "Samurai's Honor",
    coverImage: "https://images.pexels.com/photos/5486845/pexels-photo-5486845.jpeg",
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
    title: "Spirit Hunters Academy",
    coverImage: "https://images.pexels.com/photos/592077/pexels-photo-592077.jpeg",
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
    title: "Infinite Dreamscape",
    coverImage: "https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg",
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
  },
  {
    id: 7,
    title: "Astral Knights",
    coverImage: "https://images.pexels.com/photos/6771600/pexels-photo-6771600.jpeg",
    description: "Seven legendary warriors from across the galaxy unite to battle an ancient cosmic entity threatening to consume all of creation.",
    episodes: 13,
    genres: ["Space Opera", "Action"],
    rating: 9.5,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Galactic Studios"
  },
  {
    id: 8,
    title: "Garden of Memories",
    coverImage: "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg",
    description: "A beautiful, emotional journey about a girl who can see people's memories by touching the flowers they've grown.",
    episodes: 12,
    genres: ["Drama", "Slice of Life"],
    rating: 9.3,
    releaseYear: 2024,
    status: "Completed",
    studio: "Bloom Animation"
  },
  {
    id: 9,
    title: "Midnight Protocol",
    coverImage: "https://images.pexels.com/photos/2694037/pexels-photo-2694037.jpeg",
    description: "In a world where hackers fight for digital freedom, one brilliant coder discovers a conspiracy that threatens global security.",
    episodes: 24,
    genres: ["Techno-Thriller", "Mystery"],
    rating: 9.0,
    releaseYear: 2023,
    status: "Completed",
    studio: "Dark Code Productions"
  },
  {
    id: 10,
    title: "Academy of Elemental Magic",
    coverImage: "https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg",
    description: "Students with affinities for different elements navigate friendships, rivalries, and the dangers of powerful magic.",
    episodes: 26,
    genres: ["Fantasy", "School"],
    rating: 8.6,
    releaseYear: 2023,
    status: "Completed",
    studio: "Arcane Studios"
  },
  {
    id: 11,
    title: "Last Stand of the Ronin",
    coverImage: "https://images.pexels.com/photos/6898854/pexels-photo-6898854.jpeg",
    description: "A tale of honor and vengeance as the last surviving member of a samurai clan seeks to restore his family's name.",
    episodes: 12,
    genres: ["Historical", "Action"],
    rating: 9.2,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Blade Animation"
  },
  {
    id: 12,
    title: "Neon Alley Drifters",
    coverImage: "https://images.pexels.com/photos/3156381/pexels-photo-3156381.jpeg",
    description: "Street racers with modified hover cars compete in dangerous underground races through a futuristic Tokyo.",
    episodes: 16,
    genres: ["Racing", "Sci-Fi"],
    rating: 8.5,
    releaseYear: 2024,
    status: "Ongoing",
    studio: "Velocity Animation"
  }
];

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Historical", 
  "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Racing", "Cyberpunk", "School", "Martial Arts"
];

const years = [2025, 2024, 2023, 2022, 2021];
const studios = ["All Studios", "Aniverse Studios", "NeoCyber Productions", "Shogun Animation", "Phantom Works", "Digital Frontier", "Chrono Visuals"];
const status = ["All", "Ongoing", "Completed", "Upcoming"];

const AnimeDirectoryPage: React.FC = () => {
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
  const filteredAnime = animeList.filter(anime => {
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
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button 
              className="btn-ghost flex items-center justify-center space-x-2"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
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
          Showing {sortedAnime.length} of {animeList.length} titles
        </div>
        
        {/* Anime Grid */}
        {sortedAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {sortedAnime.map(anime => (
              <AnimeCard key={anime.id} anime={anime} />
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