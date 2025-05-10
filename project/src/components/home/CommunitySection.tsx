import React from 'react';
import { User, ChevronRight, MessageSquare, TrendingUp, Award, Users, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ForumThreadCard from '../ui/ForumThreadCard';
import useCommunityStats from '../../hooks/useCommunityStats';
import useTopContributors from '../../hooks/useTopContributors';
import useTrendingThreads from '../../hooks/useTrendingThreads';

// Helper function to safely render badges
const renderBadge = (badge: any, index: number) => {
  const badgeText = typeof badge === 'string' ? badge : 
                   (badge && typeof badge === 'object' && badge.name) ? 
                   String(badge.name) : 'Badge';
  
  return (
    <div 
      key={`${badgeText}-${index}`} 
      className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary-light flex items-center"
    >
      <Star className="h-3 w-3 mr-1" />
      {badgeText}
    </div>
  );
};

const CommunitySection: React.FC = () => {
  // Use custom hooks for real-time data
  const { stats, loading: statsLoading } = useCommunityStats();
  const { contributors, loading: contributorsLoading } = useTopContributors(5);
  const { threads: forumThreads, loading: threadsLoading } = useTrendingThreads(3);
  
  // Combined loading state
  const loading = statsLoading || contributorsLoading || threadsLoading;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-surface/50 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-background-light/30"></div>
      <div className="absolute -left-40 bottom-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute -right-20 top-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-block mb-2 bg-secondary/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-secondary-light">
              JOIN THE CONVERSATION
            </div>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              <span className="accent-gradient-text">Community</span> Hub
            </h2>
            <p className="text-gray-400 mt-2 max-w-lg">
              Connect with fellow anime enthusiasts and join the conversation
            </p>
          </div>
          
          <Link 
            to="/forum" 
            className="group flex items-center space-x-2 py-2 px-4 border border-secondary/30 rounded-full hover:bg-secondary/10 transition-all"
          >
            <span className="text-white group-hover:text-secondary transition-colors">Join Discussions</span>
            <ChevronRight className="h-4 w-4 text-secondary transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                Trending Discussions
              </h3>
              <Link to="/forum" className="text-secondary text-sm hover:underline">
                View all
              </Link>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : forumThreads.length > 0 ? (
                forumThreads.map((thread) => (
                  <div key={thread.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity"></div>
                    <div className="transform group-hover:-translate-y-1 transition-transform duration-300">
                      <ForumThreadCard key={thread.id} thread={thread} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No discussions found. Be the first to start a conversation!
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <Link 
                to="/forum" 
                className="group flex items-center space-x-2 py-2 px-6 border border-secondary/30 rounded-full hover:bg-secondary/10 transition-all"
              >
                <span>See More Discussions</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            {/* Enhanced Community Stats */}
            <div className="card p-6 bg-gradient-to-br from-surface/90 to-surface-dark/90 backdrop-blur-sm border border-secondary/10 rounded-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-secondary" />
                Community Stats
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Stats with progress bars */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{stats.activeMembers.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Active Members</div>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-secondary">{stats.memberGrowth}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-surface-light/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mr-3">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{stats.discussions.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Discussions</div>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-primary">{stats.discussionGrowth}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-surface-light/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center mr-3">
                          <TrendingUp className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{stats.postsThisMonth.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Posts This Month</div>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-accent">{stats.postGrowth}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-surface-light/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-primary rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Top Contributors */}
            <div className="card p-6 bg-gradient-to-br from-surface/90 to-surface-dark/90 backdrop-blur-sm border border-primary/10 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  Top Contributors
                </h3>
                <Link to="/leaderboard" className="text-xs text-primary hover:underline">View Leaderboard</Link>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : contributors.length > 0 ? (
                <>
                  {/* Podium display for top 3 */}
                  <div className="flex items-end justify-center mb-8 h-32 relative">
                    {/* Second place */}
                    {contributors.length > 1 && (
                      <div className="flex flex-col items-center mx-2 z-10">
                        <div className="relative">
                          <img 
                            src={contributors[1]?.avatar} 
                            alt="2nd place" 
                            className="h-12 w-12 rounded-full border-2 border-secondary mb-2"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-surface p-0.5 rounded-full">
                            <div className="bg-secondary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              2
                            </div>
                          </div>
                        </div>
                        <div className="h-20 w-16 bg-gradient-to-t from-secondary/30 to-secondary/5 rounded-t-lg backdrop-blur-sm"></div>
                      </div>
                    )}
                    
                    {/* First place */}
                    <div className="flex flex-col items-center mx-2 z-20">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                          <Award className="h-6 w-6 text-yellow-400 animate-pulse" />
                        </div>
                        <img 
                          src={contributors[0]?.avatar} 
                          alt="1st place" 
                          className="h-16 w-16 rounded-full border-2 border-primary mb-2 ring-2 ring-primary/50"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-surface p-0.5 rounded-full">
                          <div className="bg-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            1
                          </div>
                        </div>
                      </div>
                      <div className="h-28 w-16 bg-gradient-to-t from-primary/30 to-primary/5 rounded-t-lg backdrop-blur-sm"></div>
                    </div>
                    
                    {/* Third place */}
                    {contributors.length > 2 && (
                      <div className="flex flex-col items-center mx-2 z-10">
                        <div className="relative">
                          <img 
                            src={contributors[2]?.avatar} 
                            alt="3rd place" 
                            className="h-12 w-12 rounded-full border-2 border-accent mb-2"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-surface p-0.5 rounded-full">
                            <div className="bg-accent text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              3
                            </div>
                          </div>
                        </div>
                        <div className="h-16 w-16 bg-gradient-to-t from-accent/30 to-accent/5 rounded-t-lg backdrop-blur-sm"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detailed contributor cards */}
                  <div className="space-y-4">
                    {contributors.map((contributor, i) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg hover:bg-surface-light/30 transition-colors border border-transparent hover:border-primary/20 group"
                      >
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={contributor.avatar} 
                              alt={`${contributor.name}`} 
                              className="h-12 w-12 rounded-full border-2 border-primary/30 group-hover:border-primary transition-colors"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-surface p-0.5 rounded-full">
                              <div className={`${
                                i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : 'bg-accent'
                              } text-xs rounded-full h-5 w-5 flex items-center justify-center`}>
                                {i + 1}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-3 flex-grow">
                            <div className="font-medium text-white group-hover:text-primary transition-colors">{contributor.name}</div>
                            <div className="flex items-center text-xs">
                              <div className="flex items-center">
                                <Zap className="h-3 w-3 text-primary mr-1" />
                                <span className="text-primary">Lvl {contributor.level}</span>
                              </div>
                              <span className="mx-1">•</span>
                              <span className="text-gray-400">{contributor.posts} posts</span>
                            </div>
                          </div>
                          
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                        
                        {/* Badges - using the helper function to safely render badges */}
                        {contributor.badges && contributor.badges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {contributor.badges.map((badge, badgeIndex) => 
                              renderBadge(badge, badgeIndex)
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  No contributors data available
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Link 
                  to="/forum/contributors" 
                  className="text-sm text-primary hover:text-primary-light transition-colors inline-flex items-center"
                >
                  <span>View all contributors</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection; 