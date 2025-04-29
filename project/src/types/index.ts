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
  seasons?: number; // Number of seasons available for the anime
  episodesPerSeason?: number; // Number of episodes per season
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

export type UserRole = 'admin' | 'writer' | 'user';

export interface Badge {
  id: string;
  name: UserRole;
  color: string;
  permissions: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  joinDate: string;
  role: UserRole;
  watchlist: string[];
  level: number;
  badges: Badge[];
}

export type ForumCategory = 'General' | 'Anime' | 'Theory' | 'Memes' | 'Reviews';

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: Date;
  updatedAt: Date;
  category: ForumCategory;
  replies: number;
  upvotes: string[]; // Changed from number to string[]
  downvotes: string[]; // Changed from number to string[]
  tags: string[];
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
  }>;
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
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}