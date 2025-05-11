import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Message, Conversation } from '../types';

/**
 * Creates a new conversation between two users
 */
export const createConversation = async (user1Id: string, user2Id: string) => {
  try {
    // Check if conversation already exists
    const existingConversation = await getConversationByParticipants(user1Id, user2Id);
    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversationData = {
      participants: [user1Id, user2Id],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCount: 0
    };
    
    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return { id: docRef.id, ...conversationData };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Sends a message from one user to another
 */
export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  senderName: string,
  senderAvatar: string,
  receiverId: string, 
  content: string
) => {
  try {
    // Create message
    const messageData = {
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      content,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        content,
        senderId,
        createdAt: serverTimestamp()
      },
      updatedAt: serverTimestamp(),
      unreadCount: Timestamp.now() // Increment unread count for other participant
    });
    
    // Create notification for receiver
    try {
      const notificationsCollection = collection(db, 'notifications');
      await addDoc(notificationsCollection, {
        userId: receiverId,
        title: 'New Message',
        message: `${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        type: 'message',
        relatedId: conversationId,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (notifError) {
      console.error('Error creating message notification:', notifError);
      // Don't throw error here, as the message was still sent
    }
    
    return { id: messageRef.id, ...messageData };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Gets a conversation by its ID
 */
export const getConversationById = async (conversationId: string) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnapshot = await getDoc(conversationRef);
    
    if (!conversationSnapshot.exists()) {
      return null;
    }
    
    const conversationData = conversationSnapshot.data();
    return {
      id: conversationSnapshot.id,
      ...conversationData,
      createdAt: conversationData.createdAt instanceof Timestamp 
        ? conversationData.createdAt.toDate() 
        : new Date(),
      updatedAt: conversationData.updatedAt instanceof Timestamp 
        ? conversationData.updatedAt.toDate() 
        : new Date(),
      lastMessage: conversationData.lastMessage 
        ? {
            ...conversationData.lastMessage,
            createdAt: conversationData.lastMessage.createdAt instanceof Timestamp 
              ? conversationData.lastMessage.createdAt.toDate() 
              : new Date()
          } 
        : undefined
    } as Conversation;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

/**
 * Gets a conversation by participants
 */
export const getConversationByParticipants = async (user1Id: string, user2Id: string) => {
  try {
    const q1 = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user1Id)
    );
    
    const conversations = await getDocs(q1);
    let foundConversation = null;
    
    conversations.forEach((conversationDoc) => {
      const conversation = conversationDoc.data();
      if (conversation.participants.includes(user2Id)) {
        foundConversation = {
          id: conversationDoc.id,
          ...conversation,
          createdAt: conversation.createdAt instanceof Timestamp 
            ? conversation.createdAt.toDate() 
            : new Date(),
          updatedAt: conversation.updatedAt instanceof Timestamp 
            ? conversation.updatedAt.toDate() 
            : new Date(),
          lastMessage: conversation.lastMessage 
            ? {
                ...conversation.lastMessage,
                createdAt: conversation.lastMessage.createdAt instanceof Timestamp 
                  ? conversation.lastMessage.createdAt.toDate() 
                  : new Date()
              } 
            : undefined
        } as Conversation;
      }
    });
    
    return foundConversation;
  } catch (error) {
    console.error('Error getting conversation by participants:', error);
    throw error;
  }
};

/**
 * Gets all conversations for a user
 */
export const getUserConversations = async (userId: string) => {
  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    const conversations = conversationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate() 
          : new Date(),
        lastMessage: data.lastMessage 
          ? {
              ...data.lastMessage,
              createdAt: data.lastMessage.createdAt instanceof Timestamp 
                ? data.lastMessage.createdAt.toDate() 
                : new Date()
            } 
          : undefined
      } as Conversation;
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

/**
 * Gets messages for a conversation
 */
export const getConversationMessages = async (conversationId: string) => {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    return messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date()
      } as Message;
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for messages in a conversation
 */
export const subscribeToConversationMessages = (
  conversationId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date()
      } as Message;
    });
    
    callback(messages);
  });
};

/**
 * Sets up a real-time listener for user conversations
 */
export const subscribeToUserConversations = (
  userId: string, 
  callback: (conversations: Conversation[]) => void
) => {
  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(conversationsQuery, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate() 
          : new Date(),
        lastMessage: data.lastMessage 
          ? {
              ...data.lastMessage,
              createdAt: data.lastMessage.createdAt instanceof Timestamp 
                ? data.lastMessage.createdAt.toDate() 
                : new Date()
            } 
          : undefined
      } as Conversation;
    });
    
    callback(conversations);
  });
};

/**
 * Marks all messages in a conversation as read for a user
 */
export const markConversationAsRead = async (conversationId: string, userId: string) => {
  try {
    // Mark messages as read
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const updatePromises = messagesSnapshot.docs.map((messageDoc) => {
      const messageRef = doc(db, 'messages', messageDoc.id);
      return updateDoc(messageRef, { read: true });
    });
    
    await Promise.all(updatePromises);
    
    // Reset unread count
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, { unreadCount: 0 });
    
    return true;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * Deletes a conversation and all its messages
 */
export const deleteConversation = async (conversationId: string) => {
  try {
    // Delete messages first
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const deletePromises = messagesSnapshot.docs.map((messageDoc) => {
      const messageRef = doc(db, 'messages', messageDoc.id);
      return deleteDoc(messageRef);
    });
    
    await Promise.all(deletePromises);
    
    // Then delete conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    await deleteDoc(conversationRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}; 