import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Review, User } from '../types';

// Get all reviews for an anime
export const getAnimeReviews = async (animeId: string): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('animeId', '==', animeId),
      orderBy('createdAt', 'desc')
    );
    
    const reviewsSnapshot = await getDocs(q);
    
    return reviewsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || undefined
      } as Review;
    });
  } catch (error) {
    console.error('Error getting anime reviews:', error);
    return [];
  }
};

// Get user reviews
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const reviewsSnapshot = await getDocs(q);
    
    return reviewsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || undefined
      } as Review;
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return [];
  }
};

// Get a single review
export const getReview = async (reviewId: string): Promise<Review | null> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (reviewDoc.exists()) {
      const data = reviewDoc.data();
      return {
        id: reviewDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || undefined
      } as Review;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting review:', error);
    return null;
  }
};

// Create a review
export const createReview = async (review: Omit<Review, 'id' | 'createdAt' | 'likes'>): Promise<Review | null> => {
  try {
    // Check if user already reviewed this anime
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('animeId', '==', review.animeId),
      where('userId', '==', review.userId)
    );
    
    const existingReviews = await getDocs(q);
    
    if (!existingReviews.empty) {
      throw new Error('You have already reviewed this anime');
    }
    
    // Create the review
    const newReview = {
      ...review,
      likes: [],
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(reviewsRef, newReview);
    
    // Update user stats
    const userRef = doc(db, 'users', review.userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const reviewCount = userData.stats?.reviews || 0;
      
      await updateDoc(userRef, {
        'stats.reviews': reviewCount + 1
      });
    }
    
    return {
      id: docRef.id,
      ...newReview,
      createdAt: new Date(),
      likes: []
    } as Review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Update a review
export const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<Review | null> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    // Remove fields that shouldn't be updated
    const { id, userId, animeId, createdAt, likes, ...validUpdates } = updates;
    
    // Add updatedAt timestamp
    await updateDoc(reviewRef, {
      ...validUpdates,
      updatedAt: serverTimestamp()
    });
    
    const updatedReviewDoc = await getDoc(reviewRef);
    const data = updatedReviewDoc.data();
    
    return {
      id: updatedReviewDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string, userId: string): Promise<boolean> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    const reviewData = reviewDoc.data();
    
    // Check if the user is the author of the review
    if (reviewData.userId !== userId) {
      throw new Error('You are not authorized to delete this review');
    }
    
    await deleteDoc(reviewRef);
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const reviewCount = userData.stats?.reviews || 0;
      
      if (reviewCount > 0) {
        await updateDoc(userRef, {
          'stats.reviews': reviewCount - 1
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Like/unlike a review
export const toggleReviewLike = async (reviewId: string, userId: string): Promise<boolean> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    const reviewData = reviewDoc.data();
    const likes = reviewData.likes || [];
    
    if (likes.includes(userId)) {
      // Unlike
      await updateDoc(reviewRef, {
        likes: arrayRemove(userId)
      });
    } else {
      // Like
      await updateDoc(reviewRef, {
        likes: arrayUnion(userId)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error toggling review like:', error);
    throw error;
  }
};

// Report a review
export const reportReview = async (reviewId: string): Promise<boolean> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    
    await updateDoc(reviewRef, {
      reported: true
    });
    
    return true;
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
}; 