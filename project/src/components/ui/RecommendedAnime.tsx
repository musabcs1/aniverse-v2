import React, { useEffect, useState } from 'react';
import { Anime } from '../../types';
import { getAnimeRecommendations } from '../../services/recommendations';
import AnimeCard from './AnimeCard';
import { useTranslation } from 'react-i18next';

interface RecommendedAnimeProps {
  watchlist: Anime[];
  maxRecommendations?: number;
}

const RecommendedAnime: React.FC<RecommendedAnimeProps> = ({ 
  watchlist, 
  maxRecommendations = 6 
}) => {
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!watchlist || watchlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const animeRecommendations = await getAnimeRecommendations(watchlist, maxRecommendations);
        setRecommendations(animeRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [watchlist, maxRecommendations]);

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-surface">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {t('Loading recommendations...')}
          </span>
        </h3>
        <div className="animate-pulse flex flex-wrap gap-4">
          {[...Array(maxRecommendations)].map((_, index) => (
            <div 
              key={index} 
              className="w-[160px] h-[240px] bg-surface-dark rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-surface">
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {t('Recommendations')}
          </span>
        </h3>
        <p className="text-gray-400">
          {watchlist.length === 0
            ? t('Add anime to your watchlist to get personalized recommendations')
            : t('Not enough data to generate recommendations')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-surface">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
          {t('Recommended For You')}
        </span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedAnime;