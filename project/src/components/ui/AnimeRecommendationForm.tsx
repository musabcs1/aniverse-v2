import React, { useState, useEffect } from 'react';
import { Search, Send, X } from 'lucide-react';
import { Anime, User } from '../../types';
import { collection, getDocs, query, where, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

interface AnimeRecommendationFormProps {
  recipient: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const AnimeRecommendationForm: React.FC<AnimeRecommendationFormProps> = ({
  recipient,
  onSuccess,
  onCancel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const animeRef = collection(db, 'anime');
      const q = query(
        animeRef,
        where('title', '>=', searchQuery),
        where('title', '<=', searchQuery + '\uf8ff'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
      showToast('Anime arama sırasında bir hata oluştu', 'error');
    } finally {
      setSearching(false);
    }
  };
  
  const handleSelectAnime = (anime: Anime) => {
    setSelectedAnime(anime);
    setSearchResults([]);
    setSearchQuery('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !selectedAnime) {
      showToast('Lütfen önermek için bir anime seçin', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      // Add recommendation to Firestore
      await addDoc(collection(db, 'recommendations'), {
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderAvatar: currentUser.avatar,
        recipientId: recipient.id,
        animeId: selectedAnime.id,
        animeTitle: selectedAnime.title,
        animeImage: selectedAnime.coverImage,
        message: message.trim(),
        createdAt: serverTimestamp(),
        viewed: false
      });
      
      showToast('Anime önerisi başarıyla gönderildi', 'success');
      onSuccess();
    } catch (error) {
      console.error('Error sending recommendation:', error);
      showToast('Öneri gönderilirken bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Trigger search when query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);
  
  return (
    <div className="bg-surface-dark border border-gray-700/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Anime Öner</h2>
        <button 
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-gray-700/50"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {!selectedAnime ? (
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Anime Ara</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-light border border-gray-700 rounded-md p-2 pl-10 text-white"
                placeholder="Önermek istediğiniz anime adını yazın..."
                disabled={searching}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {searching && (
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="mt-2 bg-surface-light border border-gray-700 rounded-md overflow-hidden">
                {searchResults.map(anime => (
                  <div
                    key={anime.id}
                    className="flex items-center p-2 hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => handleSelectAnime(anime)}
                  >
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="h-12 w-8 object-cover rounded mr-3"
                    />
                    <div>
                      <div className="font-medium">{anime.title}</div>
                      <div className="text-xs text-gray-400">{anime.releaseYear}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Seçilen Anime</label>
            <div className="flex items-center bg-surface-light border border-gray-700 rounded-md p-3">
              <img
                src={selectedAnime.coverImage}
                alt={selectedAnime.title}
                className="h-16 w-12 object-cover rounded mr-3"
              />
              <div className="flex-1">
                <div className="font-medium">{selectedAnime.title}</div>
                <div className="text-sm text-gray-400">{selectedAnime.releaseYear}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnime(null)}
                className="p-1 rounded-full hover:bg-gray-700/50"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="message" className="block mb-2 text-gray-300">Mesajınız (İsteğe Bağlı)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-surface-light border border-gray-700 rounded-md p-2 text-white min-h-[100px]"
            placeholder={`${recipient.username} kullanıcısına neden bu animeyi önerdiğinizi yazabilirsiniz...`}
            maxLength={500}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700/50"
            disabled={submitting}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 flex items-center space-x-2 disabled:opacity-50"
            disabled={!selectedAnime || submitting}
          >
            {submitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Öner</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnimeRecommendationForm; 