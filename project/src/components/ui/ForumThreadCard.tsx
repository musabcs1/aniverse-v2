import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { ForumThread } from '../../types';

interface ForumThreadCardProps {
  thread: ForumThread;
}

const ForumThreadCard: React.FC<ForumThreadCardProps> = ({ thread }) => {
  return (
    <div className="card p-4 hover:border-l-4 hover:border-l-primary transition-all">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3">
          <img 
            src={thread.authorAvatar} 
            alt={thread.authorName} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <Link to={`/forum/${thread.id}`} className="font-bold text-white hover:text-secondary transition-colors">
              {thread.title}
            </Link>
            <div className="flex items-center mt-1 text-xs text-gray-400">
              <span>by {thread.authorName}</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(thread.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface px-2 py-1 rounded-full text-xs">
          {thread.category}
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mt-3 line-clamp-2">
        {thread.content}
      </p>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <div className="flex space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{thread.replies}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 hover:text-secondary transition-colors">
              <ThumbsUp className="h-3 w-3" />
              <span>{thread.upvotes}</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-accent transition-colors">
              <ThumbsDown className="h-3 w-3" />
              <span>{thread.downvotes}</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {thread.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumThreadCard;