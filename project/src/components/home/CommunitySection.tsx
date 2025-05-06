import React, { useEffect, useState } from 'react';
import { User, ChevronRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ForumThreadCard from '../ui/ForumThreadCard';
import { ForumThread } from '../../types'; // Ensure ForumThread type is imported

// Define a type for the community data
interface CommunityData {
  forumThreads: ForumThread[];
  stats: {
    activeMembers: number;
    discussions: number;
    postsThisMonth: number;
  };
  contributors: {
    avatar: string;
    name: string;
    level: number;
    posts: number;
  }[];
}

const CommunitySection: React.FC = () => {
  const [communityData, setCommunityData] = useState<CommunityData>({
    forumThreads: [],
    stats: {
      activeMembers: 0,
      discussions: 0,
      postsThisMonth: 0
    },
    contributors: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const data: CommunityData = {
        forumThreads: [
          {
            id: "1",
            title: "Sample Thread",
            content: "Sample content",
            authorId: "user1",
            authorName: "User1",
            authorAvatar: "https://i.pravatar.cc/150?img=1",
            category: "General",
            createdAt: new Date("2025-04-28T12:00:00"),
            updatedAt: new Date("2025-04-28T12:00:00"),
            replies: 10,
            upvotes: ["user2", "user3"],
            downvotes: ["user4"],
            tags: ["sample", "discussion"],
            comments: []
          }
        ],
        stats: {
          activeMembers: 1000,
          discussions: 200,
          postsThisMonth: 500
        },
        contributors: [
          {
            avatar: "https://i.pravatar.cc/40?img=2",
            name: "Contributor1",
            level: 10,
            posts: 50
          }
        ]
      };
      setCommunityData(data);
    };

    fetchData();
  }, []);

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
            {communityData.forumThreads.map((thread: ForumThread) => (
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
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{communityData.stats.activeMembers}</div>
                    <div className="text-sm text-gray-400">Active Members</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{communityData.stats.discussions}</div>
                    <div className="text-sm text-gray-400">Discussions</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                    <ChevronRight className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{communityData.stats.postsThisMonth}</div>
                    <div className="text-sm text-gray-400">Posts This Month</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-xl font-semibold mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {communityData.contributors.map((contributor: any, i: number) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={contributor.avatar} 
                        alt={`Top user ${i}`} 
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{contributor.name}</div>
                      <div className="text-xs text-gray-400">Level {contributor.level}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-primary/30 rounded-full">
                      {contributor.posts} posts
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