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
    studio: "Aniverse Studios"
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
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Varsayılan olarak giriş yapılmış

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-400">Please Sign In to View Your Profile</h1>
      </div>
    );
  }

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
        
        {/* Rest of the Profile Page */}
      </div>
    </div>
  );
};

export default ProfilePage;