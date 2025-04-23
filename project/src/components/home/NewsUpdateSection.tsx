import React from 'react';
import { ChevronRight } from 'lucide-react';
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-orbitron font-bold">
              <span className="gradient-text">Latest</span> News & Updates
            </h2>
            <p className="text-gray-400 mt-2">Stay informed with the anime world's latest happenings</p>
          </div>
          
          <Link to="/news" className="flex items-center space-x-1 text-secondary hover:text-secondary-light transition-colors">
            <span>All news</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsArticles.map((article, index) => (
            <NewsCard key={article.id} article={article} featured={index === 0} />
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link to="/news" className="btn-ghost py-3 px-6">
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsUpdateSection;