import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ThumbsUp, Flag, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toggleReviewLike, reportReview, deleteReview } from '../../services/reviews';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '../../hooks/useToast';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState(
    review.likes.includes(currentUser?.id || '')
  );
  const [likeCount, setLikeCount] = useState(review.likes.length);
  const { showToast } = useToast();
  
  const handleLikeToggle = async () => {
    if (!currentUser) {
      showToast('Beğenmek için giriş yapmalısınız', 'error');
      return;
    }
    
    try {
      await toggleReviewLike(review.id, currentUser.id);
      
      if (isLiked) {
        setLikeCount(prev => prev - 1);
      } else {
        setLikeCount(prev => prev + 1);
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Beğeni işlemi sırasında bir hata oluştu', 'error');
    }
  };
  
  const handleReport = async () => {
    if (!currentUser) {
      showToast('Rapor etmek için giriş yapmalısınız', 'error');
      return;
    }
    
    try {
      await reportReview(review.id);
      showToast('İnceleme rapor edildi', 'success');
    } catch (error) {
      console.error('Error reporting review:', error);
      showToast('Rapor işlemi sırasında bir hata oluştu', 'error');
    }
  };
  
  const handleDelete = async () => {
    if (!currentUser) return;
    
    if (window.confirm('Bu incelemeyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteReview(review.id, currentUser.id);
        showToast('İnceleme başarıyla silindi', 'success');
        if (onDelete) onDelete(review.id);
      } catch (error) {
        console.error('Error deleting review:', error);
        showToast('Silme işlemi sırasında bir hata oluştu', 'error');
      }
    }
  };
  
  const isAuthor = currentUser?.id === review.userId;
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: tr
  });
  
  return (
    <div className="bg-surface-dark border border-gray-700/30 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${review.username}`}>
            <img 
              src={review.userAvatar || '/default-avatar.png'} 
              alt={review.username} 
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link to={`/profile/${review.username}`} className="font-medium text-white hover:text-primary">
              {review.username}
            </Link>
            <div className="text-xs text-gray-400">{formattedDate}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-surface-light px-2 py-1 rounded">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{review.rating}</span>
            <span className="text-gray-400 text-xs">/10</span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-700/50"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-light rounded-md shadow-lg z-10 border border-gray-700">
                {isAuthor && onEdit && (
                  <button 
                    onClick={() => {
                      setShowActions(false);
                      onEdit(review);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700/50"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Düzenle
                  </button>
                )}
                
                {isAuthor && (
                  <button 
                    onClick={() => {
                      setShowActions(false);
                      handleDelete();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-700/50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </button>
                )}
                
                {!isAuthor && (
                  <button 
                    onClick={() => {
                      setShowActions(false);
                      handleReport();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700/50"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Rapor Et
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-bold mb-2">{review.title}</h3>
      
      {/* Content */}
      <div className="text-gray-300 mb-4">
        {review.spoiler ? (
          <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
            <div className="text-yellow-500 mb-2 text-sm font-medium">Spoiler Uyarısı</div>
            <div className="blur-sm hover:blur-none transition-all duration-300">
              {review.content}
            </div>
          </div>
        ) : (
          <p>{review.content}</p>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <button 
          onClick={handleLikeToggle}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
            isLiked 
              ? 'bg-primary/20 text-primary' 
              : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary' : ''}`} />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard; 