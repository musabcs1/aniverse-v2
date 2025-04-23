import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../../types';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, featured = false }) => {
  return (
    <Link to={`/news/${article.id}`} className="card group overflow-hidden">
      <div className="relative">
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className={`w-full object-cover ${featured ? 'h-60' : 'h-44'} transition-transform duration-500 group-hover:scale-110`}
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs bg-accent text-white rounded-full">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{new Date(article.publishDate).toLocaleDateString()}</span>
        </div>
        
        <h3 className={`font-bold text-white group-hover:text-secondary transition-colors ${featured ? 'text-xl' : 'text-base'}`}>
          {article.title}
        </h3>
        
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
          {article.excerpt}
        </p>
        
        <div className="flex items-center mt-4 text-secondary text-sm font-medium">
          <span>Read more</span>
          <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;