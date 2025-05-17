import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createReview, updateReview } from '../../services/reviews';
import { useToast } from '../../hooks/useToast';

interface ReviewFormProps {
  animeId: string;
  existingReview?: Review;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  animeId,
  existingReview,
  onSuccess,
  onCancel
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [spoiler, setSpoiler] = useState(existingReview?.spoiler || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!existingReview;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      showToast('İnceleme yazmak için giriş yapmalısınız', 'error');
      return;
    }
    
    if (!title.trim()) {
      setError('Lütfen bir başlık girin');
      return;
    }
    
    if (!content.trim()) {
      setError('Lütfen inceleme içeriğini girin');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (isEditing) {
        await updateReview(existingReview.id, {
          title,
          content,
          rating,
          spoiler
        });
        showToast('İnceleme başarıyla güncellendi', 'success');
      } else {
        await createReview({
          animeId,
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatar,
          title,
          content,
          rating,
          spoiler
        });
        showToast('İnceleme başarıyla oluşturuldu', 'success');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'İnceleme gönderilirken bir hata oluştu');
      showToast('İnceleme gönderilirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStarRating = () => {
    const stars = [];
    
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`p-1 ${i <= rating ? 'text-yellow-500' : 'text-gray-500'}`}
        >
          <Star className={`h-6 w-6 ${i <= rating ? 'fill-yellow-500' : ''}`} />
        </button>
      );
    }
    
    return (
      <div className="flex flex-wrap justify-center">
        {stars}
      </div>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-surface-dark border border-gray-700/30 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? 'İncelemeyi Düzenle' : 'Yeni İnceleme Yaz'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block mb-1 text-gray-300">Puanınız</label>
        <div className="bg-surface-light p-3 rounded-md">
          {renderStarRating()}
          <div className="text-center mt-2 font-medium text-lg">{rating}/10</div>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="title" className="block mb-1 text-gray-300">Başlık</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-surface-light border border-gray-700 rounded-md p-2 text-white"
          placeholder="İncelemeniz için kısa bir başlık yazın"
          maxLength={100}
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block mb-1 text-gray-300">İnceleme</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-surface-light border border-gray-700 rounded-md p-2 text-white min-h-[150px]"
          placeholder="Anime hakkındaki düşüncelerinizi paylaşın..."
          required
        />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="spoiler"
            checked={spoiler}
            onChange={(e) => setSpoiler(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="spoiler" className="text-gray-300">
            Bu inceleme spoiler içeriyor
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700/50"
          disabled={loading}
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>{isEditing ? 'Güncelleniyor...' : 'Gönderiliyor...'}</span>
            </span>
          ) : (
            isEditing ? 'Güncelle' : 'Gönder'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm; 