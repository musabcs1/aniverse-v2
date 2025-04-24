import React, { useState } from 'react';
import { 
  User, Settings, Shield, Heart, BookOpen, MessageSquare, 
  Clock, Award, ChevronRight, Edit, Eye, EyeOff 
} from 'lucide-react';
import AnimeCard from '../components/ui/AnimeCard';
import { Anime, User as UserType } from '../types';

// Sample user data
const userData: UserType = {
  id: 1,
  username: "AnimeExplorer",
  email: "anime.explorer@example.com",
  avatar: "https://i.pravatar.cc/150?img=33",
  joinDate: "2023-11-15",
  watchlist: [1, 5, 7],
  level: 24,
  badges: ["Alpha Tester", "Forum Veteran", "Content Creator"]
};

// Sample data for watchlist
const watchlistAnime: Anime[] = [
  {
    id: 1,
    title: "Celestial Legends: The Awakening",
    coverImage: "https://images.pexels.com/photos/3732475/pexels-photo-3732475.jpeg",
    description: "A forgotten prophecy. A reluctant hero. As ancient powers reawaken, Hiro must embrace his hidden destiny.",
    episodes: 24,
    genres: ["Fantasy", "Action"],
    rating: 9.2,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Elysium Studios"
  },
  {
    id: 5,
    title: "Infinite Dreamscape",
    coverImage: "https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg",
    description: "A groundbreaking virtual reality MMORPG becomes a battlefield when players discover they cannot log out.",
    episodes: 24,
    genres: ["Adventure", "Fantasy"],
    rating: 8.8,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Digital Frontier"
  },
  {
    id: 7,
    title: "Astral Knights",
    coverImage: "https://images.pexels.com/photos/6771600/pexels-photo-6771600.jpeg",
    description: "Seven legendary warriors from across the galaxy unite to battle an ancient cosmic entity threatening to consume all of creation.",
    episodes: 13,
    genres: ["Space Opera", "Action"],
    rating: 9.5,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Galactic Studios"
  }
];

// Sample recent activity
const recentActivity = [
  {
    id: 1,
    type: "comment",
    content: "Commented on 'Celestial Legends Episode 10 Discussion'",
    timestamp: "2025-04-16T15:32:00"
  },
  {
    id: 2,
    type: "rating",
    content: "Rated 'Cyber Nexus 2099' 9/10",
    timestamp: "2025-04-15T09:17:00"
  },
  {
    id: 3,
    type: "watchlist",
    content: "Added 'Astral Knights' to watchlist",
    timestamp: "2025-04-14T23:05:00"
  },
  {
    id: 4,
    type: "forum",
    content: "Created forum thread 'Top 10 Underrated Anime of 2024'",
    timestamp: "2025-04-13T14:28:00"
  }
];

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("watchlist");
  
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-surface rounded-xl overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-primary/30 to-accent/30 relative">
            <button className="absolute top-4 right-4 bg-surface/30 backdrop-blur-sm p-2 rounded-lg text-white hover:bg-surface/50 transition-colors">
              <Edit className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center relative">
            <div className="absolute -top-16 left-6 h-24 w-24 rounded-full border-4 border-surface overflow-hidden">
              <img 
                src={userData.avatar} 
                alt={userData.username} 
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="mt-10 md:mt-0 md:ml-28">
              <h1 className="text-2xl font-bold text-white">{userData.username}</h1>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>Member since {new Date(userData.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex mt-4 md:mt-0 md:ml-auto space-x-3">
              <button className="btn-ghost py-2 px-4 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button className="btn-primary py-2 px-4">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    <span>Watching</span>
                  </div>
                  <span className="text-white font-semibold">8</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Heart className="h-5 w-5 mr-2 text-accent" />
                    <span>Completed</span>
                  </div>
                  <span className="text-white font-semibold">42</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <MessageSquare className="h-5 w-5 mr-2 text-secondary" />
                    <span>Comments</span>
                  </div>
                  <span className="text-white font-semibold">127</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>Reviews</span>
                  </div>
                  <span className="text-white font-semibold">15</span>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-gray-300">Level {userData.level}</span>
                  </div>
                  <span className="text-xs text-gray-400">1337 XP</span>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4"></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">463 XP until next level</p>
              </div>
            </div>
            
            <div className="bg-surface rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-4">Badges</h3>
              <div className="space-y-3">
                {userData.badges.map((badge, index) => (
                  <div key={index} className="flex items-center p-2 bg-surface-light rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center mr-3">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-surface rounded-xl p-5">
              <h3 className="text-xl font-semibold mb-4">Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <Eye className="h-5 w-5 mr-2 text-secondary" />
                    <span>Profile Visibility</span>
                  </div>
                  <span className="text-white font-semibold">Public</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <EyeOff className="h-5 w-5 mr-2 text-secondary" />
                    <span>Activity Visibility</span>
                  </div>
                  <span className="text-white font-semibold">Friends</span>
                </div>
              </div>
              
              <button className="mt-4 text-secondary text-sm flex items-center">
                <span>Manage privacy settings</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-800 mb-6">
              <div className="flex space-x-8">
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'watchlist' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('watchlist')}
                >
                  Watchlist
                  {activeTab === 'watchlist' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'activity' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                  {activeTab === 'activity' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'reviews' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                  {activeTab === 'reviews' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'settings' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                  {activeTab === 'settings' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'watchlist' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Watchlist</h2>
                  <button className="text-secondary text-sm flex items-center">
                    <span>View all</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchlistAnime.map(anime => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
                
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Recently Completed</h2>
                    <button className="text-secondary text-sm flex items-center">
                      <span>View all</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="bg-surface-light rounded-lg p-8 text-center">
                    <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No completed anime yet</h3>
                    <p className="text-gray-400 mb-6">
                      Start marking shows as completed to track your anime journey.
                    </p>
                    <button className="btn-primary py-2 px-4">
                      Browse Anime
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="bg-surface p-4 rounded-lg">
                      <div className="flex items-start">
                        <img 
                          src={userData.avatar} 
                          alt={userData.username} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-white">
                            <span className="font-medium">{userData.username}</span> {activity.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 py-3 text-center text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-colors">
                  Load More Activity
                </button>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="bg-surface-light rounded-lg p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
                <p className="text-gray-400 mb-6">
                  Share your thoughts on anime by writing reviews.
                </p>
                <button className="btn-primary py-2 px-4">
                  Write a Review
                </button>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-surface rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input 
                          type="text" 
                          className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          value={userData.username}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full bg-surface-dark p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                          value={userData.email}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Avatar</h3>
                    <div className="flex items-center">
                      <img 
                        src={userData.avatar} 
                        alt={userData.username} 
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <button className="btn-ghost py-2 px-4">
                        Change Avatar
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Password</h3>
                    <button className="btn-ghost py-2 px-4">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <button className="btn-primary py-2 px-6">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;