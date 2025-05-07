import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Trash } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { NewsArticle } from '../../types';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  userRole?: string | null;
  onDelete?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, featured = false, userRole, onDelete }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking delete
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await deleteDoc(doc(db, 'news', article.id.toString()));
      onDelete?.();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

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
        {(userRole === 'writer' || userRole === 'admin') && (
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 text-red-500 hover:text-red-400 transition-colors"
            title="Delete article"
          >
            <Trash className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <Clock className="h-3 w-3 mr-1" />
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