import React from 'react';
import { ChevronRight, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import ForumThreadCard from '../ui/ForumThreadCard';
import { ForumThread } from '../../types';

// Sample data
const forumThreads: ForumThread[] = [
  {
    id: 1,
    title: "Celestial Legends Episode 10 Discussion [SPOILERS]",
    content: "That plot twist at the end was incredible! I never saw it coming. What do you think about the reveal of Kaito's true identity?",
    authorId: 1,
    authorName: "AnimeExplorer",
    authorAvatar: "https://i.pravatar.cc/150?img=33",
    category: "Anime",
    createdAt: "2025-04-16T15:32:00",
    updatedAt: "2025-04-16T15:32:00",
    replies: 47,
    upvotes: 89,
    downvotes: 2,
    tags: ["celestial-legends", "discussion", "theories"]
  },
  {
    id: 2,
    title: "Top 10 Underrated Anime of 2024 That Deserve More Attention",
    content: "We all know the big hitters, but let's talk about some hidden gems that flew under the radar last year. Here's my list of underappreciated anime...",
    authorId: 2,
    authorName: "OtakuSensei",
    authorAvatar: "https://i.pravatar.cc/150?img=11",
    category: "General",
    createdAt: "2025-04-15T09:17:00",
    updatedAt: "2025-04-15T12:45:00",
    replies: 23,
    upvotes: 56,
    downvotes: 3,
    tags: ["underrated", "recommendations", "2024"]
  }
];

const CommunitySection: React.FC = () => {
  return (
    <section className="py-16 bg-background-light">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-orbitron font-bold mb-2">
              <span className="accent-gradient-text">Community</span> Hub
            </h2>
            <p className="text-gray-400">Connect with fellow anime enthusiasts</p>
          </div>
          
          <Link to="/forum" className="flex items-center space-x-1 text-accent hover:text-accent-light transition-colors">
            <span>Join discussions</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold mb-4">Trending Discussions</h3>
            {forumThreads.map(thread => (
              <ForumThreadCard key={thread.id} thread={thread} />
            ))}
            <div className="flex justify-center mt-8">
              <Link to="/forum" className="btn-ghost py-2 px-4">
                See More Discussions
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24,815</div>
                    <div className="text-sm text-gray-400">Active Members</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3,427</div>
                    <div className="text-sm text-gray-400">Discussions</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">42,968</div>
                    <div className="text-sm text-gray-400">Posts This Month</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={`https://i.pravatar.cc/40?img=${20 + i}`} 
                        alt={`Top user ${i}`} 
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">AnimeUser{i}00{i}</div>
                      <div className="text-xs text-gray-400">Level {30 - i * 2}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-primary/30 rounded-full">
                      {150 - i * 12} posts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;