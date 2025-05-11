import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Conversation } from '../types';
import { subscribeToUserConversations } from '../services/messages';
import ConversationItem from '../components/ui/ConversationItem';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { MessageSquare, Search, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUsers, setOtherUsers] = useState<Record<string, { id: string; username: string; avatar?: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const unsubscribe = subscribeToUserConversations(currentUser.id, (updatedConversations) => {
      setConversations(updatedConversations);
      setLoading(false);
      
      // Get other users' info
      updatedConversations.forEach(async (conversation) => {
        const otherUserId = conversation.participants.find(id => id !== currentUser.id);
        if (otherUserId && !otherUsers[otherUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setOtherUsers(prev => ({
                ...prev,
                [otherUserId]: {
                  id: otherUserId,
                  username: userData.username || 'Unknown User',
                  avatar: userData.avatar
                }
              }));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const otherUserId = conversation.participants.find(id => id !== currentUser?.id);
    if (!otherUserId) return false;
    
    const otherUser = otherUsers[otherUserId];
    if (!otherUser) return false;
    
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleNewConversation = () => {
    navigate('/messages/new');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-secondary border-b-transparent rounded-full animate-spin animate-delay-150"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mt-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Loading messages...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
            
            <button 
              onClick={handleNewConversation}
              className="btn-primary py-2 px-4 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="bg-surface py-3 pl-10 pr-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Conversations List */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-lg">
            {filteredConversations.length > 0 ? (
              <div className="divide-y divide-surface-dark">
                {filteredConversations.map(conversation => {
                  const otherUserId = conversation.participants.find(id => id !== currentUser?.id);
                  if (!otherUserId || !otherUsers[otherUserId]) return null;
                  
                  return (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation} 
                      otherUser={otherUsers[otherUserId]} 
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-500" />
                </div>
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-medium mb-2 text-gray-300">No matching conversations</h3>
                    <p className="text-gray-400 max-w-xs">
                      We couldn't find any conversations matching "{searchQuery}"
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium mb-2 text-gray-300">No conversations yet</h3>
                    <p className="text-gray-400 max-w-xs mb-6">
                      Start a conversation with another user to chat with them
                    </p>
                    <button 
                      onClick={handleNewConversation}
                      className="btn-primary py-2 px-6"
                    >
                      Start a conversation
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MessagesPage; 