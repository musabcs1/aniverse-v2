export interface Anime {
  id: number;
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

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  joinDate: string;
  watchlist: number[];
  level: number;
  badges: string[];
}

export interface ForumThread {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  category: 'Anime' | 'Theory' | 'Memes' | 'Reviews' | 'General';
  createdAt: string;
  updatedAt: string;
  replies: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
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