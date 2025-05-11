import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove, 
  setDoc, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CustomList, Anime } from '../types';

// Get all custom lists for a user
export const getUserCustomLists = async (userId: string): Promise<CustomList[]> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDocSnap.data();
    return (userData?.customLists || []) as CustomList[];
  } catch (error) {
    console.error('Error fetching user custom lists:', error);
    throw error;
  }
};

// Create a new custom list
export const createCustomList = async (userId: string, listData: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomList> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User not found');
    }
    
    const newList: CustomList = {
      ...listData,
      id: `list_${Date.now()}`, // Generate a unique ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Get current custom lists or initialize empty array
    const userData = userDocSnap.data();
    const customLists: CustomList[] = (userData?.customLists || []) as CustomList[];
    
    // Add the new list
    await updateDoc(userDocRef, {
      customLists: [...customLists, newList]
    });
    
    return newList;
  } catch (error) {
    console.error('Error creating custom list:', error);
    throw error;
  }
};

// Update an existing custom list
export const updateCustomList = async (userId: string, listId: string, updatedData: Partial<Omit<CustomList, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CustomList> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDocSnap.data();
    const customLists: CustomList[] = (userData?.customLists || []) as CustomList[];
    
    // Find the list to update
    const listIndex = customLists.findIndex((list: CustomList) => list.id === listId);
    if (listIndex === -1) {
      throw new Error('List not found');
    }
    
    // Update the list
    const updatedList: CustomList = {
      ...customLists[listIndex],
      ...updatedData,
      updatedAt: new Date()
    };
    
    customLists[listIndex] = updatedList;
    
    await updateDoc(userDocRef, { customLists });
    
    return updatedList;
  } catch (error) {
    console.error('Error updating custom list:', error);
    throw error;
  }
};

// Delete a custom list
export const deleteCustomList = async (userId: string, listId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDocSnap.data();
    const customLists: CustomList[] = (userData?.customLists || []) as CustomList[];
    
    // Filter out the list to delete
    const updatedLists = customLists.filter((list: CustomList) => list.id !== listId);
    
    await updateDoc(userDocRef, { customLists: updatedLists });
  } catch (error) {
    console.error('Error deleting custom list:', error);
    throw error;
  }
};

// Add anime to a custom list
export const addAnimeToCustomList = async (userId: string, listId: string, animeId: string): Promise<CustomList> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDocSnap.data();
    const customLists: CustomList[] = (userData?.customLists || []) as CustomList[];
    
    // Find the list
    const listIndex = customLists.findIndex((list: CustomList) => list.id === listId);
    if (listIndex === -1) {
      throw new Error('List not found');
    }
    
    // Add anime if not already in the list
    if (!customLists[listIndex].animeIds.includes(animeId)) {
      customLists[listIndex].animeIds.push(animeId);
      customLists[listIndex].updatedAt = new Date();
      
      await updateDoc(userDocRef, { customLists });
    }
    
    return customLists[listIndex];
  } catch (error) {
    console.error('Error adding anime to custom list:', error);
    throw error;
  }
};

// Remove anime from a custom list
export const removeAnimeFromCustomList = async (userId: string, listId: string, animeId: string): Promise<CustomList> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDocSnap.data();
    const customLists: CustomList[] = (userData?.customLists || []) as CustomList[];
    
    // Find the list
    const listIndex = customLists.findIndex((list: CustomList) => list.id === listId);
    if (listIndex === -1) {
      throw new Error('List not found');
    }
    
    // Remove anime from the list
    customLists[listIndex].animeIds = customLists[listIndex].animeIds.filter((id: string) => id !== animeId);
    customLists[listIndex].updatedAt = new Date();
    
    await updateDoc(userDocRef, { customLists });
    
    return customLists[listIndex];
  } catch (error) {
    console.error('Error removing anime from custom list:', error);
    throw error;
  }
};

// Fetch anime details for a custom list
export const fetchCustomListAnimeDetails = async (animeIds: string[]): Promise<Anime[]> => {
  try {
    const animePromises = animeIds.map(async (animeId: string) => {
      const animeDocRef = doc(db, 'anime', animeId);
      const animeDocSnap = await getDoc(animeDocRef);
      
      if (animeDocSnap.exists()) {
        return { 
          id: animeId, 
          ...animeDocSnap.data() 
        } as Anime;
      }
      
      return null;
    });
    
    const animeDetails = await Promise.all(animePromises);
    
    // Filter out nulls (anime that weren't found)
    return animeDetails.filter((anime): anime is Anime => anime !== null);
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
}; 