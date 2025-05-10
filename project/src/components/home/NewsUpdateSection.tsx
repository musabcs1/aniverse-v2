import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsCard from '../ui/NewsCard';
import { NewsArticle } from '../../types';

// Sample data
const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Celestial Legends Announces Second Season",
    excerpt: "Fan-favorite series confirms return with new characters and expanded world-building.",
    content: "",
    coverImage: "https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg",
    authorId: 1,
    authorName: "Aki Tanaka",
    authorAvatar: "https://i.pravatar.cc/150?img=32",
    category: "News",
    publishDate: "2025-04-15",
    tags: ["announcement", "sequel", "fantasy"]
  },
  {
    id: 2,
    title: "Behind the Animation: Cyber Nexus 2099",
    excerpt: "An exclusive look at the groundbreaking animation techniques used in the cyberpunk thriller.",
    content: "",
    coverImage: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg",
    authorId: 2,
    authorName: "Marcus Chen",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    category: "Industry",
    publishDate: "2025-04-10",
    tags: ["animation", "technology", "interview"]
  },
  {
    id: 3,
    title: "Voice Actor Spotlight: Yuki Kaji",
    excerpt: "Industry veteran discusses his upcoming roles and reflections on his legendary career.",
    content: "",
    coverImage: "https://images.pexels.com/photos/7383469/pexels-photo-7383469.jpeg",
    authorId: 3,
    authorName: "Emma Stone",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    category: "Industry",
    publishDate: "2025-04-07",
    tags: ["voice-actor", "interview", "career"]
  },
  {
    id: 4,
    title: "Spring 2025 Anime Season Preview",
    excerpt: "Our comprehensive guide to all the exciting new series coming this season.",
    content: "",
    coverImage: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
    authorId: 4,
    authorName: "Jason Lee",
    authorAvatar: "https://i.pravatar.cc/150?img=8",
    category: "News",
    publishDate: "2025-04-01",
    tags: ["season-preview", "upcoming", "guide"]
  }
];

const NewsUpdateSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjMTEwNzI2IiBkPSJNMCAwaDYwdjYwSDB6Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iI0ZGMDBGRiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block mb-2 bg-accent/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-accent-light">
              LATEST UPDATES
            </div>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              <span className="gradient-text">Latest</span> News & Updates
            </h2>
            <p className="text-gray-400 mt-2 max-w-lg">
              Stay informed with the anime world's latest happenings and industry insights
            </p>
          </div>
          
          <Link 
            to="/news" 
            className="group flex items-center space-x-2 py-2 px-4 border border-accent/30 rounded-full hover:bg-accent/10 transition-all"
          >
            <span className="text-white group-hover:text-accent transition-colors">All News</span>
            <ChevronRight className="h-4 w-4 text-accent transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Featured article */}
          <div className="md:col-span-6 lg:col-span-8">
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity"></div>
              <div className="transform group-hover:-translate-y-1 transition-transform duration-300 h-full">
                <NewsCard article={newsArticles[0]} featured={true} />
              </div>
            </div>
          </div>
          
          {/* Secondary articles */}
          <div className="md:col-span-6 lg:col-span-4 grid grid-cols-1 gap-6">
            {newsArticles.slice(1, 3).map((article) => (
              <div key={article.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity"></div>
                <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                  <NewsCard article={article} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional articles in a row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsArticles.slice(3).map((article) => (
            <div key={article.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity"></div>
              <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                <NewsCard article={article} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link 
            to="/news" 
            className="group flex items-center space-x-2 py-3 px-8 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full hover:from-accent/30 hover:to-primary/30 transition-all border border-accent/20"
          >
            <span>View All Articles</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsUpdateSection;