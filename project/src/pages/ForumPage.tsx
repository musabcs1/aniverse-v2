import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, TrendingUp, Users, Plus } from 'lucide-react';
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
      const totalUpvotes = threads.reduce((sum, thread) => sum + thread.upvotes.length, 0); // Use length of upvotes array
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
      // Fetch the correct avatar URL from the user profile database
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const authorAvatar = userData.avatar || 'https://i.pravatar.cc/150?img=33';

      const threadsRef = collection(db, 'forumThreads');
      await addDoc(threadsRef, {
        ...newThread,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorAvatar, // Use the fetched avatar URL
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        replies: 0,
        upvotes: 0,
        downvotes: 0,
        tags: [],
      });

      // Update user's XP in Firestore
      await updateDoc(userDocRef, {
        xp: increment(10), // Increment XP by 10
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
      alert('Thread deleted successfully.');
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const filteredThreads = forumThreads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || thread.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-orbitron font-bold">
              <span className="gradient-text">Community</span> Forum
            </h1>
            <p className="text-gray-400 mt-2">Join discussions with fellow anime enthusiasts</p>
          </div>
          <button
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            onClick={() => setShowNewThreadForm(!showNewThreadForm)}
          >
            <Plus className="h-5 w-5" />
            <span>Create Thread</span>
          </button>
        </div>

        {/* New Thread Form */}
        {showNewThreadForm && (
          <div className="mb-8 p-6 bg-surface rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Create New Thread</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Thread Title"
                className="w-full bg-surface-light py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newThread.title}
                onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                name="content"
                placeholder="Thread Content"
                className="w-full bg-surface-light py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={5}
                value={newThread.content}
                onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
              />
              <select
                name="category"
                className="w-full bg-surface-light py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
              <button 
                className="btn-primary py-2 px-4"
                onClick={handleCreateThread}
              >
                Post Thread
              </button>
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
                className="w-full bg-surface py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <select
              className="bg-surface py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Anime">Anime</option>
              <option value="General">General</option>
              <option value="Theory">Theory</option>
              <option value="Memes">Memes</option>
              <option value="Reviews">Reviews</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {filteredThreads.map(thread => (
              <div key={thread.id}>
                <ForumThreadCard thread={thread} />
                {auth.currentUser?.uid === thread.authorId && (
                  <button
                    onClick={() => handleDeleteThread(thread)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete Thread
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Forum Stats */}
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Forum Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stats.totalThreads}</div>
                    <div className="text-sm text-gray-400">Total Threads</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stats.totalReplies}</div>
                    <div className="text-sm text-gray-400">Total Replies</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stats.totalUpvotes}</div>
                    <div className="text-sm text-gray-400">Total Upvotes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                  Trending Topics
                </span>
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="p-2 rounded hover:bg-surface-light transition-colors">
                    <span className="text-sm text-gray-300">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Be respectful to other members</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Use appropriate tags for discussions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Mark spoilers appropriately</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>No spam or self-promotion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span>Follow content guidelines</span>
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
