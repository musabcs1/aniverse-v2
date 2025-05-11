import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getConversationById, 
  subscribeToConversationMessages, 
  sendMessage, 
  markConversationAsRead,
  deleteConversation
} from '../services/messages';
import { Message } from '../types';
import MessageBubble from '../components/ui/MessageBubble';
import { ArrowLeft, MessageSquare, Trash, Menu } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';

const MessageDetailPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ id: string; username: string; avatar?: string } | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser || !conversationId) {
      navigate('/messages');
      return;
    }

    const fetchConversation = async () => {
      try {
        const conversation = await getConversationById(conversationId);
        if (!conversation) {
          navigate('/messages');
          return;
        }

        // Get the other user's info
        const otherUserId = conversation.participants.find(id => id !== currentUser.id);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setOtherUser({
              id: otherUserId,
              username: userData.username || 'Unknown User',
              avatar: userData.avatar
            });
          }
        }

        // Mark conversation as read
        await markConversationAsRead(conversationId, currentUser.id);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversation();

    // Subscribe to messages
    const unsubscribe = subscribeToConversationMessages(conversationId, (updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
      
      // Mark as read when new messages come in
      if (updatedMessages.some(m => !m.read && m.senderId !== currentUser.id)) {
        markConversationAsRead(conversationId, currentUser.id).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [conversationId, currentUser, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !otherUser || !conversationId) return;
    
    try {
      await sendMessage(
        conversationId,
        currentUser.id,
        currentUser.username,
        currentUser.avatar || '',
        otherUser.id,
        newMessage.trim()
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;
    
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        await deleteConversation(conversationId);
        navigate('/messages');
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
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
            Loading conversation...
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
          className="bg-surface rounded-xl overflow-hidden shadow-lg flex flex-col h-[calc(100vh-200px)]"
        >
          {/* Header */}
          <div className="p-4 border-b border-surface-dark flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/messages')}
                className="p-2 mr-3 rounded-full hover:bg-surface-dark"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-300" />
              </button>
              
              {otherUser && (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={otherUser.avatar || 'https://via.placeholder.com/40'} 
                      alt={otherUser.username} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/40';
                      }}
                    />
                  </div>
                  <h2 className="font-medium text-white">{otherUser.username}</h2>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-full hover:bg-surface-dark"
                aria-label="More options"
              >
                <Menu className="h-5 w-5 text-gray-300" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-dark rounded-lg shadow-lg overflow-hidden z-10">
                  <button 
                    onClick={handleDeleteConversation}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-surface-light flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-surface-dark">
            {messages.length > 0 ? (
              <div>
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isOwnMessage={message.senderId === currentUser?.id} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-400">
                  No messages yet. Start the conversation by sending a message below.
                </p>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-surface-dark">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-surface-dark py-3 px-4 rounded-l-xl focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-primary-dark transition-colors py-3 px-4 rounded-r-xl"
                disabled={!newMessage.trim()}
              >
                <MessageSquare className="h-5 w-5 text-white" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MessageDetailPage; 