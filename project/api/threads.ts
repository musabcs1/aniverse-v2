import { db } from '../src/firebaseConfig';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { createThreadDeletedNotification } from './notifications';

/**
 * Deletes a thread and notifies the thread owner.
 * @param threadId - The ID of the thread to delete.
 * @returns A promise that resolves when the thread is deleted.
 */
export async function deleteThread(threadId: string): Promise<void> {
  try {
    const threadRef = doc(db, 'threads', threadId);
    const threadSnapshot = await getDoc(threadRef);

    if (!threadSnapshot.exists()) {
      throw new Error('Thread not found');
    }

    const threadData = threadSnapshot.data();
    const threadOwnerId = threadData?.authorId;
    const threadTitle = threadData?.title || 'Untitled';

    // Delete the thread
    await deleteDoc(threadRef);

    // Notify the thread owner
    if (threadOwnerId) {
      await createThreadDeletedNotification(threadOwnerId, threadTitle);
    }
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
}