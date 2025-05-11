import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { createConversation } from '../services/messages';
import { ArrowLeft, Search, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const NewMessagePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; username: string; avatar?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || !currentUser) return;
    
    setSearching(true);
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', searchQuery),
        where('username', '<=', searchQuery + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      
      const foundUsers = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          username: doc.data().username,
          avatar: doc.data().avatar
        }))
        .filter(user => user.id !== currentUser.id); // Exclude current user
      
      setUsers(foundUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async (userId: string) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const conversation = await createConversation(currentUser.id, userId);
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate('/messages')}
              className="p-2 mr-3 rounded-full hover:bg-surface-dark"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold text-white">New Message</h1>
          </div>
          
          {/* Search */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-lg mb-6">
            <form onSubmit={handleSearch} className="p-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for users by username..." 
                  className="bg-surface-dark py-3 pl-10 pr-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <button 
                  type="submit"
                  className="absolute right-3 top-2 btn-primary py-1.5 px-4 text-sm"
                  disabled={!searchQuery.trim() || searching}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>
          
          {/* User Results */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-lg">
            {users.length > 0 ? (
              <div className="divide-y divide-surface-dark">
                {users.map(user => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={user.avatar || 'https://via.placeholder.com/40'} 
                          alt={user.username} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/40';
                          }}
                        />
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                    <button 
                      onClick={() => handleStartConversation(user.id)}
                      className="btn-primary py-2 px-4 flex items-center"
                      disabled={loading}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-medium mb-2 text-gray-300">No users found</h3>
                    <p className="text-gray-400 max-w-xs">
                      We couldn't find any users matching "{searchQuery}"
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium mb-2 text-gray-300">Search for users</h3>
                    <p className="text-gray-400 max-w-xs">
                      Search for users by username to start a conversation
                    </p>
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

export default NewMessagePage; 