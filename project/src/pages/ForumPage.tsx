import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, TrendingUp, Users, Plus, ThumbsUp, SlidersHorizontal } from 'lucide-react';
import ForumThreadCard from '../components/ui/ForumThreadCard';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { ForumThread, ForumCategory } from '../types';

const categories: ForumCategory[] = ['General', 'Anime', 'Theory', 'Memes', 'Reviews'];

const ForumPage: React.FC = () => {
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newThread, setNewThread] = useState<{
    title: string;
    content: string;
    category: ForumCategory;
  }>({
    title: '',
    content: '',
    category: 'General'
  });
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [stats, setStats] = useState({
    totalThreads: 0,
    totalReplies: 0,
    totalUpvotes: 0
  });
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);

  // Real-time listener for forum threads
  useEffect(() => {
    const threadsRef = collection(db, 'forumThreads');
    const threadsQuery = query(threadsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(threadsQuery, (snapshot) => {
      const threads = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: data.category as ForumCategory, // Type assertion here
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          comments: data.comments || [], // Ensure comments are initialized
        } as ForumThread;
      });

      setForumThreads(threads);

      // Update stats
      const totalThreads = threads.length;
      const totalReplies = threads.reduce((sum, thread) => sum + thread.replies, 0);
      const totalUpvotes = threads.reduce((sum, thread) => sum + (Array.isArray(thread.upvotes) ? thread.upvotes.length : 0), 0); // Ensure upvotes is an array before accessing length
      setStats({ totalThreads, totalReplies, totalUpvotes });

      // Update trending topics
      const trending = threads
        .sort((a, b) => (b.replies + b.upvotes.length) - (a.replies + a.upvotes.length)) // Use length of upvotes array
        .slice(0, 5)
        .map(thread => thread.title);
      setTrendingTopics(trending);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateThread = async () => {
    if (!auth.currentUser) {
      alert('Please sign in to create a thread');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const authorAvatar = userData.avatar || 'https://secure.gravatar.com/avatar/f0431f05c802c06f06a3e5997b3053df/?default=https%3A%2F%2Fus.v-cdn.net%2F5020483%2Fuploads%2Fdefaultavatar%2FK2266OAKOLNC.jpg&rating=g&size=200';

      const threadsRef = collection(db, 'forumThreads');
      await addDoc(threadsRef, {
        ...newThread,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorAvatar,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replies: 0,
        upvotes: [],
        downvotes: [],
        tags: [],
      });

      // Update user's XP and stats in Firestore
      await updateDoc(userDocRef, {
        xp: increment(10),
        'stats.threads': increment(1),
        level: Math.floor((userData.xp + 10) / 1000) + 1
      });

      setShowNewThreadForm(false);
      setNewThread({ title: '', content: '', category: 'General' });
      alert('Thread created successfully! You earned 10 XP.');
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread. Please try again.');
    }
  };

  const handleDeleteThread = async (thread: ForumThread) => {
    if (!auth.currentUser || auth.currentUser.uid !== thread.authorId) {
      alert('You are not authorized to delete this thread.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this thread?');
    if (!confirmDelete) return;

    try {
      const threadRef = doc(db, 'forumThreads', thread.id);
      await deleteDoc(threadRef);

      // Update user's XP and stats in Firestore
      const userDocRef = doc(db, 'users', thread.authorId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      await updateDoc(userDocRef, {
        xp: increment(-10),
        'stats.threads': increment(-1),
        level: Math.floor((userData.xp - 10) / 1000) + 1
      });

      alert('Thread deleted successfully.');
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread. Please try again.');
    }
  };

  const filteredThreads = forumThreads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || thread.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjMTEwNzI2IiBkPSJNMCAwaDYwdjYwSDB6Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzk5MDBGRiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')]">
      <div className="container mx-auto px-4">
        {/* Header with background */}
        <div className="relative mb-12 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 opacity-80"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-orbitron font-bold">
                  <span className="gradient-text">Community</span> Forum
                </h1>
                <p className="text-gray-200 mt-2 max-w-lg">
                  Join discussions with fellow anime enthusiasts and share your thoughts
                </p>
              </div>
              <button
                className="btn-primary flex items-center space-x-2 py-3 px-6 hover:scale-105 transition-transform"
                onClick={() => setShowNewThreadForm(!showNewThreadForm)}
              >
                <Plus className="h-5 w-5" />
                <span>Create Thread</span>
              </button>
            </div>
            
            {/* Stats bar */}
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.totalThreads}</div>
                  <div className="text-xs text-gray-200">Threads</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.totalReplies}</div>
                  <div className="text-xs text-gray-200">Replies</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.totalUpvotes}</div>
                  <div className="text-xs text-gray-200">Upvotes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Thread Form */}
        {showNewThreadForm && (
          <div className="mb-8 p-8 bg-surface/80 backdrop-blur-sm rounded-xl border border-primary/20">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              Create New Thread
            </h2>
            <div className="space-y-6">
              <input
                type="text"
                name="title"
                placeholder="Thread Title"
                className="w-full bg-surface-light py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                value={newThread.title}
                onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                name="content"
                placeholder="Thread Content"
                className="w-full bg-surface-light py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                rows={5}
                value={newThread.content}
                onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
              />
              <select
                name="category"
                className="w-full bg-surface-light py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                value={newThread.category}
                onChange={(e) => setNewThread(prev => ({ 
                  ...prev, 
                  category: e.target.value as ForumCategory 
                }))}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <button 
                  className="btn-primary py-2 px-6 hover:scale-105 transition-transform"
                  onClick={handleCreateThread}
                >
                  Post Thread
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search discussions..."
                className="w-full bg-surface/80 backdrop-blur-sm py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary border border-secondary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-surface/80 backdrop-blur-sm py-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary border border-secondary/20"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <SlidersHorizontal className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <div className="absolute right-3 top-3.5 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {filteredThreads.length > 0 ? (
              filteredThreads.map(thread => (
                <div key={thread.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity"></div>
                  <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                    <ForumThreadCard thread={thread} />
                    {auth.currentUser?.uid === thread.authorId && (
                      <button
                        onClick={() => handleDeleteThread(thread)}
                        className="ml-4 text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete thread
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-xl text-center border border-secondary/10">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No threads found</h3>
                <p className="text-gray-400">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Be the first to start a discussion!'}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {/* Trending Topics */}
            <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-xl border border-secondary/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                Trending Topics
              </h3>
              <ul className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <span className="text-secondary font-bold">{index + 1}</span>
                    <span className="text-gray-300 truncate">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Category List */}
            <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-xl border border-secondary/10">
              <h3 className="text-xl font-semibold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    selectedCategory === 'All'
                      ? 'bg-secondary/30 text-white'
                      : 'bg-surface-light/50 text-gray-300 hover:bg-surface-light'
                  } transition-colors`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      selectedCategory === category
                        ? 'bg-secondary/30 text-white'
                        : 'bg-surface-light/50 text-gray-300 hover:bg-surface-light'
                    } transition-colors`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Forum Guidelines */}
            <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
              <h3 className="text-xl font-semibold mb-4 text-primary">Forum Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs text-primary mt-0.5">1</div>
                  <span>Be respectful to other community members</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs text-primary mt-0.5">2</div>
                  <span>No spoilers without proper warning tags</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs text-primary mt-0.5">3</div>
                  <span>Stay on topic within each category</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs text-primary mt-0.5">4</div>
                  <span>No self-promotion or spam</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
