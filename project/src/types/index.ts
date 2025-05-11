export interface Anime {
  id: string; // Updated to string to match Firestore's document ID type
  title: string;
  coverImage: string;
  bannerImage?: string;
  description: string;
  episodes: number;
  genres: string[];
  rating: number;
  releaseYear: number;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  studio: string;
  voiceActors?: VoiceActor[];
  seasons?: { name: string; episodes: number }[]; // Array of seasons with name and episode count
  episodesPerSeason?: number; // Number of episodes per season
  hasEpisodesData?: boolean; // Flag to indicate if episodes data is available
}

// New interface for anime episodes data in Firebase
export interface AnimeEpisodes {
  animeId: string;
  seasons: {
    [seasonName: string]: {
      [episodeNumber: string]: {
        embedCodes: {
          [language: string]: string; // en, tr, etc.
        };
        title?: string;
      }
    }
  }
}

export interface VoiceActor {
  id: number;
  name: string;
  character: string;
  image: string;
}

export interface Episode {
  id: number;
  animeId: number;
  number: number;
  title: string;
  thumbnail: string;
  duration: number;
  releaseDate: string;
}

export type UserRole = 'admin' | 'writer' | 'user' | 'reviewer';

export interface Badge {
  id: string;
  name: UserRole;
  color: string;
  permissions: string[];
}

export interface User {
  stats: any;
  id: string;
  username: string;
  email: string;
  avatar: string;
  banner?: string;
  joinDate: string;
  role: UserRole;
  watchlist: string[];
  watchlistDetails?: Anime[]; // Optional array of anime details
  completed?: string[]; // Optional array of completed anime IDs
  level: number;
  xp: number;
  badges: Badge[];
  profileHidden?: boolean; // Flag to indicate if the user's profile is hidden from others
}

export type ForumCategory = 'General' | 'Anime' | 'Theory' | 'Memes' | 'Reviews';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string; // Made this property required
  createdAt: Date;
  updatedAt: Date;
  category: ForumCategory;
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  replies: number;
  reported?: boolean; // Add reported flag
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  category: 'News' | 'Release' | 'Industry' | 'Review';
  publishDate: string;
  tags: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'message' | 'activity' | 'anime';
  relatedId?: string;
  createdAt: Date;
  read: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}