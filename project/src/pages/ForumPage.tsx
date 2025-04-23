import React from 'react';
import { Search, Filter, MessageSquare, TrendingUp, Users, BarChart2, Plus } from 'lucide-react';
import ForumThreadCard from '../components/ui/ForumThreadCard';
import { ForumThread } from '../types';

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
  },
  {
    id: 3,
    title: "Character Analysis: The Psychological Depth of Villains in Modern Anime",
    content: "Modern anime has evolved to feature complex, morally gray antagonists. Let's discuss how recent villains differ from the one-dimensional bad guys of the past...",
    authorId: 3,
    authorName: "PsychAnime",
    authorAvatar: "https://i.pravatar.cc/150?img=68",
    category: "Theory",
    createdAt: "2025-04-14T23:05:00",
    updatedAt: "2025-04-15T08:12:00",
    replies: 34,
    upvotes: 72,
    downvotes: 5,
    tags: ["character-analysis", "villains", "psychology"]
  },
  {
    id: 4,
    title: "When did you first fall in love with anime? Share your story!",
    content: "For me, it was watching Studio Ghibli's Spirited Away as a kid. I was completely entranced by the animation, story, and world-building. What about you all?",
    authorId: 4,
    authorName: "NostalgiaChan",
    authorAvatar: "https://i.pravatar.cc/150?img=47",
    category: "General",
    createdAt: "2025-04-13T14:28:00",
    updatedAt: "2025-04-13T14:28:00",
    replies: 89,
    upvotes: 103,
    downvotes: 1,
    tags: ["personal", "stories", "introduction"]
  },
  {
    id: 5,
    title: "Music Appreciation: Best Anime Soundtracks of All Time",
    content: "A great soundtrack can elevate an anime to legendary status. Let's discuss the composers and soundtracks that have left the biggest impact on the medium...",
    authorId: 5,
    authorName: "MelodyMaster",
    authorAvatar: "https://i.pravatar.cc/150?img=29",
    category: "General",
    createdAt: "2025-04-12T18:41:00",
    updatedAt: "2025-04-12T20:13:00",
    replies: 56,
    upvotes: 68,
    downvotes: 4,
    tags: ["music", "soundtrack", "composers"]
  }
];

const categories = ["All", "Anime", "General", "Theory", "Memes", "Reviews", "News"];
const sortOptions = ["Newest", "Most Popular", "Most Replies", "Top Rated"];

const ForumPage: React.FC = () => {
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
          
          <button className="btn-primary flex items-center space-x-2 mt-4 md:mt-0">
            <Plus className="h-5 w-5" />
            <span>Create Thread</span>
          </button>
        </div>
        
        {/* Search and Filters Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search discussions..." 
                className="w-full bg-surface py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            
            <select className="bg-surface py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select className="bg-surface py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Forum Threads */}
          <div className="lg:col-span-3 space-y-6">
            {forumThreads.map(thread => (
              <ForumThreadCard key={thread.id} thread={thread} />
            ))}
            
            <div className="flex justify-center mt-8">
              <button className="btn-ghost py-2 px-4">
                Load More
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Forum Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">8,427</div>
                    <div className="text-sm text-gray-400">Total Threads</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">24,815</div>
                    <div className="text-sm text-gray-400">Active Members</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                    <BarChart2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">156,793</div>
                    <div className="text-sm text-gray-400">Total Posts</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Popular Tags */}
            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["discussion", "recommendations", "theories", "artwork", "memes", "reviews", "episode-discussion", "character-analysis", "news", "wallpapers", "fanfiction"].map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-surface-light text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
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
                {["Celestial Legends Season 2", "Cyber Nexus 2099 Theories", "Spring 2025 Anime", "Top 10 Fight Scenes", "Best Anime Opening Songs"].map((topic, index) => (
                  <div key={index} className="p-2 rounded hover:bg-surface-light transition-colors">
                    <a href="#" className="text-sm hover:text-secondary transition-colors">
                      {topic}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Forum Rules */}
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
              <a href="#" className="text-secondary text-sm block mt-3">
                View Full Guidelines
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;