import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Eye, Plus } from 'lucide-react';
import AnimeRecommendationForm from './AnimeRecommendationForm';
import { useToast } from '../../hooks/useToast';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Recommendation {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  animeId: string;
  animeTitle: string;
  animeImage: string;
  message?: string;
  createdAt: Date;
  viewed: boolean;
}

interface UserRecommendationsProps {
  user: User;
}

const UserRecommendations: React.FC<UserRecommendationsProps> = ({ user }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recommendationsRef = collection(db, 'recommendations');
      
      // If viewing own profile, get recommendations received
      // If viewing someone else's profile, get recommendations sent to them by current user
      const isOwnProfile = currentUser?.id === user.id;
      
      let q;
      if (isOwnProfile) {
        q = query(
          recommendationsRef,
          where('recipientId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      } else {
        if (!currentUser) return;
        
        q = query(
          recommendationsRef,
          where('senderId', '==', currentUser.id),
          where('recipientId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const fetchedRecommendations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Recommendation;
      });
      
      setRecommendations(fetchedRecommendations);
      
      // Mark unviewed recommendations as viewed if viewing own profile
      if (isOwnProfile) {
        const unviewedRecommendations = fetchedRecommendations.filter(rec => !rec.viewed);
        
        for (const rec of unviewedRecommendations) {
          await updateDoc(doc(db, 'recommendations', rec.id), {
            viewed: true
          });
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      showToast('Önerileri yüklerken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user.id) {
      fetchRecommendations();
    }
  }, [user.id, currentUser?.id]);
  
  const handleRecommendationSuccess = () => {
    setShowRecommendForm(false);
    fetchRecommendations();
    showToast('Öneri başarıyla gönderildi', 'success');
  };
  
  const isOwnProfile = currentUser?.id === user.id;
  
  return (
    <div className="bg-surface-dark border border-gray-700/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {isOwnProfile ? 'Anime Önerileri' : `${user.username} için Önerileriniz`}
        </h2>
        
        {!isOwnProfile && currentUser && (
          <button
            onClick={() => setShowRecommendForm(true)}
            className="flex items-center space-x-1 bg-primary px-3 py-1 rounded-md hover:bg-primary/80 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Anime Öner</span>
          </button>
        )}
      </div>
      
      {showRecommendForm && (
        <div className="mb-6">
          <AnimeRecommendationForm
            recipient={user}
            onSuccess={handleRecommendationSuccess}
            onCancel={() => setShowRecommendForm(false)}
          />
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map(recommendation => (
            <div key={recommendation.id} className="flex bg-surface-light rounded-lg overflow-hidden">
              <img
                src={recommendation.animeImage}
                alt={recommendation.animeTitle}
                className="w-16 h-24 object-cover"
              />
              <div className="flex-1 p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{recommendation.animeTitle}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <img
                        src={recommendation.senderAvatar || '/default-avatar.png'}
                        alt={recommendation.senderName}
                        className="w-4 h-4 rounded-full mr-1"
                      />
                      <span>
                        {isOwnProfile ? `${recommendation.senderName} önerdi` : 'Sizin öneriniz'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(recommendation.createdAt), {
                      addSuffix: true,
                      locale: tr
                    })}
                  </div>
                </div>
                
                {recommendation.message && (
                  <div className="mt-2 text-sm text-gray-300 flex items-start">
                    <MessageSquare className="h-3 w-3 mr-1 mt-0.5 text-gray-500" />
                    <p className="line-clamp-2">{recommendation.message}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <Link
                    to={`/anime/${recommendation.animeId}`}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Animeye Git
                  </Link>
                  
                  {!recommendation.viewed && isOwnProfile && (
                    <div className="flex items-center text-xs text-yellow-500">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>Yeni</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          {isOwnProfile ? (
            <>
              <MessageSquare className="h-10 w-10 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">Henüz hiç öneri almadınız</p>
            </>
          ) : (
            <>
              <MessageSquare className="h-10 w-10 mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">Bu kullanıcıya henüz anime önermediniz</p>
              <button
                onClick={() => setShowRecommendForm(true)}
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 text-sm"
              >
                İlk Öneriyi Yap
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRecommendations; 