import React, { useState, useEffect, useMemo } from 'react';
import { Search, MessageSquare, TrendingUp, Users, Plus } from 'lucide-react';
import ForumThreadCard from '../components/ui/ForumThreadCard';
import { ForumThread } from '../types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom';

interface ForumStats {
  totalThreads: number;
  totalReplies: number;
  totalUpvotes: number;
}

interface TrendingTopic {
  title: string;
  id: string;
}

const ForumPage: React.FC = () => {
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [forumStats, setForumStats] = useState<ForumStats>({
    totalThreads: 0,
    totalReplies: 0,
    totalUpvotes: 0,
  });

  useEffect(() => {
    const threadsCollection = collection(db, 'forumThreads');
    const threadsQuery = query(threadsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(threadsQuery, (snapshot) => {
      const threadsData: ForumThread[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          replies: data.replies || 0,
          upvotes: data.upvotes || 0,
          createdAt: data.createdAt,
        };
      });

      setForumThreads(threadsData);

      const totalThreads = threadsData.length;
      const totalReplies = threadsData.reduce((sum, thread) => sum + thread.replies, 0);
      const totalUpvotes = threadsData.reduce((sum, thread) => sum + thread.upvotes, 0);

      setForumStats({ totalThreads, totalReplies, totalUpvotes });

      const trending = [...threadsData]
        .sort((a, b) => b.replies - a.replies)
        .slice(0, 5)
        .map((thread) => ({ title: thread.title, id: thread.id }));

      setTrendingTopics(trending);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredThreads = useMemo(() => {
    return forumThreads.filter((thread) =>
      thread.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [forumThreads, searchTerm]);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-orbitron font-bold">
              <span className="gradient-text">Community</span> Forum
            </h1>
            <p className="text-gray-400 mt-2">Join discussions with fellow anime enthusiasts</p>
          </div>
          <Link
            to="/create-thread"
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            aria-label="Create a new thread"
          >
            <Plus className="h-5 w-5" />
            <span>Create Thread</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search discussions..."
              className="w-full bg-surface py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Forum Threads */}
          <div className="lg:col-span-3 space-y-6">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <ForumThreadCard key={thread.id} thread={thread} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400">No threads found. Start a discussion!</p>
              </div>
            )}
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
                    <div className="text-lg font-bold">{forumStats.totalThreads}</div>
                    <div className="text-sm text-gray-400">Total Threads</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{forumStats.totalReplies}</div>
                    <div className="text-sm text-gray-400">Total Replies</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{forumStats.totalUpvotes}</div>
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
                {trendingTopics.map((topic) => (
                  <div key={topic.id} className="p-2 rounded hover:bg-surface-light transition-colors">
                    <Link to={`/forum/${topic.id}`} className="text-sm hover:text-secondary transition-colors">
                      {topic.title}
                    </Link>
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
