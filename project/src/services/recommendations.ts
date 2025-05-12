import { Anime } from '../types';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

/**
 * Recommends anime based on user's watchlist using a simple algorithm
 * that considers genres, ratings, and status
 */
export const getAnimeRecommendations = async (watchlist: Anime[], maxRecommendations: number = 6): Promise<Anime[]> => {
  try {
    if (!watchlist || watchlist.length === 0) {
      return [];
    }

    // Extract genres from watchlist
    const userGenrePreferences = new Map<string, number>();
    const watchedAnimeIds = new Set(watchlist.map(anime => anime.id));
    
    // Calculate genre preferences
    watchlist.forEach(anime => {
      anime.genres.forEach(genre => {
        const currentCount = userGenrePreferences.get(genre) || 0;
        userGenrePreferences.set(genre, currentCount + 1);
      });
    });

    // Sort genres by preference count
    const sortedGenres = Array.from(userGenrePreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Get top 3 genres (or fewer if user has watched fewer genres)
    const topGenres = sortedGenres.slice(0, 3);
    
    // Calculate average rating from watchlist
    const averageRating = watchlist.reduce((sum, anime) => sum + anime.rating, 0) / watchlist.length;
    
    // Fetch potential recommendations from Firestore
    const animeRef = collection(db, 'anime');
    const animeSnapshot = await getDocs(animeRef);
    
    // Convert to Anime objects and filter out already watched anime
    const allAnime = animeSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Anime))
      .filter(anime => !watchedAnimeIds.has(anime.id));

    // Score each potential recommendation
    const scoredRecommendations = allAnime.map(anime => {
      let score = 0;
      
      // Genre matching (highest weight)
      const genreMatchCount = anime.genres.filter(genre => topGenres.includes(genre)).length;
      score += genreMatchCount * 10;
      
      // Rating similarity (medium weight)
      const ratingDifference = Math.abs(anime.rating - averageRating);
      score += (5 - ratingDifference) * 2; // Higher score for closer ratings
      
      // Status preference (slight boost for completed anime)
      if (anime.status === 'Completed') {
        score += 2;
      }
      
      return { anime, score };
    });

    // Sort by score and return top recommendations
    const recommendations = scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)
      .map(item => item.anime);

    return recommendations;
  } catch (error) {
    console.error('Error getting anime recommendations:', error);
    return [];
  }
};