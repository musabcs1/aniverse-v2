import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Users, MessageSquare, Heart, Share2, Plus, Info,ThumbsUp } from 'lucide-react';
import { Anime, Episode } from '../types';

// Sample anime details
const animeDetails: Record<string, Anime> = {
  "1": {
    id: 1,
    title: "Celestial Legends: The Awakening",
    coverImage: "https://images.pexels.com/photos/3732475/pexels-photo-3732475.jpeg",
    bannerImage: "https://images.pexels.com/photos/6155088/pexels-photo-6155088.jpeg",
    description: "In a world where the boundary between humans and celestial beings has blurred, a forgotten prophecy foretells the awakening of an ancient power. When ordinary high school student Hiro Tachibana discovers he's the descendant of a legendary celestial warrior, he must embrace his destiny to prevent dark forces from plunging the world into eternal darkness. Alongside his friends and a mysterious celestial guide, Hiro embarks on a journey to master his newfound powers and uncover the truth about his heritage.",
    episodes: 24,
    genres: ["Fantasy", "Action", "Adventure", "Drama"],
    rating: 9.2,
    releaseYear: 2025,
    status: "Ongoing",
    studio: "Aniverse Studios",
    voiceActors: [
      {
        id: 1,
        name: "Yuki Kaji",
        character: "Hiro Tachibana",
        image: "https://i.pravatar.cc/150?img=33"
      },
      {
        id: 2,
        name: "Saori Hayami",
        character: "Akane Mizuki",
        image: "https://i.pravatar.cc/150?img=29"
      },
      {
        id: 3,
        name: "Mamoru Miyano",
        character: "Ryu Takahashi",
        image: "https://i.pravatar.cc/150?img=57"
      },
      {
        id: 4,
        name: "Ayane Sakura",
        character: "Luna Celestia",
        image: "https://i.pravatar.cc/150?img=46"
      }
    ]
  }
};

// Sample episodes
const episodes: Episode[] = [
  {
    id: 1,
    animeId: 1,
    number: 1,
    title: "The Prophecy Awakens",
    thumbnail: "https://images.pexels.com/photos/8017069/pexels-photo-8017069.jpeg?auto=compress&cs=tinysrgb&w=600",
    duration: 24,
    releaseDate: "2025-01-05"
  },
  {
    id: 2,
    animeId: 1,
    number: 2,
    title: "Celestial Powers",
    thumbnail: "https://images.pexels.com/photos/3841338/pexels-photo-3841338.jpeg?auto=compress&cs=tinysrgb&w=600",
    duration: 24,
    releaseDate: "2025-01-12"
  },
  {
    id: 3,
    animeId: 1,
    number: 3,
    title: "The First Trial",
    thumbnail: "https://images.pexels.com/photos/8037273/pexels-photo-8037273.jpeg?auto=compress&cs=tinysrgb&w=600",
    duration: 24,
    releaseDate: "2025-01-19"
  },
  {
    id: 4,
    animeId: 1,
    number: 4,
    title: "Shadows of the Past",
    thumbnail: "https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=600",
    duration: 24,
    releaseDate: "2025-01-26"
  },
  {
    id: 5,
    animeId: 1,
    number: 5,
    title: "The Dark Omen",
    thumbnail: "https://images.pexels.com/photos/1809644/pexels-photo-1809644.jpeg?auto=compress&cs=tinysrgb&w=600",
    duration: 24,
    releaseDate: "2025-02-02"
  },
  {
    id: 6,
    animeId: 1,
    number: 6,
    title: "Allies and Enemies",
    thumbnail: "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=600",
    duration: 24,
    releaseDate: "2025-02-09"
  }
];

// Sample reviews
const reviews = [
  {
    id: 1,
    user: "AnimeExplorer",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 9.5,
    content: "Absolutely stunning animation and compelling storyline. The character development is top-notch, and the action sequences are breathtaking. Easily one of the best new anime this season!",
    date: "2025-02-15"
  },
  {
    id: 2,
    user: "OtakuSensei",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 8.9,
    content: "The world-building is incredible, and the mythology they've created feels both fresh and familiar. The pacing can be a bit slow at times, but overall it's a fantastic watch.",
    date: "2025-01-30"
  }
];

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("episodes");
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  // Get anime details from the sample data
  const anime = id ? animeDetails[id] : null;
  
  if (!anime) {
    return <div className="container mx-auto px-4 py-24">Anime not found</div>;
  }
  
  const animeEpisodes = episodes.filter(ep => ep.animeId === anime.id);

  return (
    <div className="pb-16">
      {/* Banner */}
      <div 
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${anime.bannerImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-end">
            <img 
              src={anime.coverImage} 
              alt={anime.title} 
              className="w-40 h-56 object-cover rounded-lg shadow-lg border-4 border-surface"
            />
            
            <div className="mt-4 md:mt-0 md:ml-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {anime.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-xs rounded-full bg-primary/40 text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-2">
                {anime.title}
              </h1>
              
              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{anime.rating.toFixed(1)} Rating</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{anime.releaseYear}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{anime.episodes} Episodes</span>
                </div>
                
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{anime.status}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{anime.studio}</span>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  className="btn-primary flex items-center space-x-2 py-2.5 px-5"
                  onClick={() => setVideoPlaying(true)}
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Now</span>
                </button>
                
                <button className="btn-ghost flex items-center space-x-2 py-2.5 px-5">
                  <Plus className="h-5 w-5" />
                  <span>Add to List</span>
                </button>
                
                <button className="relative h-10 w-10 rounded-full bg-surface-light flex items-center justify-center hover:bg-surface transition-colors">
                  <Heart className="h-5 w-5 text-accent" />
                </button>
                
                <button className="relative h-10 w-10 rounded-full bg-surface-light flex items-center justify-center hover:bg-surface transition-colors">
                  <Share2 className="h-5 w-5 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Video Player Section */}
            {videoPlaying ? (
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden mb-8">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white mb-4">Video player would be here in a real implementation</p>
                    <button 
                      className="btn-secondary py-2 px-4"
                      onClick={() => setVideoPlaying(false)}
                    >
                      Close Player
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed">
                  {anime.description}
                </p>
              </div>
            )}
            
            {/* Tabs Navigation */}
            <div className="border-b border-gray-800 mb-6">
              <div className="flex space-x-8">
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'episodes' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('episodes')}
                >
                  Episodes
                  {activeTab === 'episodes' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></span>
                  )}
                </button>
                
                <button 
                  className={`pb-3 relative ${
                    activeTab === 'characters' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('characters')}
                >
                  Characters
                  {activeTab === 'characters' && (
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
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'episodes' && (
              <div className="space-y-4">
                {animeEpisodes.map(episode => (
                  <div key={episode.id} className="bg-surface rounded-lg overflow-hidden flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 relative overflow-hidden">
                      <img 
                        src={episode.thumbnail} 
                        alt={episode.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <button className="h-12 w-12 rounded-full bg-primary/80 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">
                            Episode {episode.number}: {episode.title}
                          </h3>
                          <span className="text-sm text-gray-400">{episode.duration} min</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          Released: {new Date(episode.releaseDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex space-x-2">
                          <button className="text-secondary text-sm flex items-center">
                            <Play className="h-4 w-4 mr-1" />
                            Watch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'characters' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {anime.voiceActors?.map(actor => (
                  <div key={actor.id} className="bg-surface rounded-lg overflow-hidden flex">
                    <img 
                      src={actor.image} 
                      alt={actor.name} 
                      className="w-16 h-16 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-medium">{actor.character}</h3>
                      <p className="text-sm text-gray-400">Voiced by: {actor.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">User Reviews</h3>
                  <button className="btn-ghost py-1.5 px-3 text-sm">
                    Write a Review
                  </button>
                </div>
                
                {reviews.map(review => (
                  <div key={review.id} className="bg-surface rounded-lg p-4">
                    <div className="flex items-start">
                      <img 
                        src={review.avatar} 
                        alt={review.user} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{review.user}</span>
                          <div className="flex items-center ml-3 bg-primary/30 px-2 py-0.5 rounded text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-300">
                      {review.content}
                    </p>
                    <div className="flex items-center mt-3 text-sm text-gray-400">
                      <button className="flex items-center mr-4 hover:text-gray-300">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful
                      </button>
                      <button className="flex items-center hover:text-gray-300">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4">
                <span className="gradient-text">Related</span> Anime
              </h3>
              <div className="space-y-4">
                {[2, 5, 7].map(relatedId => {
                  const relatedAnime = animeDetails[relatedId.toString()] ||animeList.find(a => a.id === relatedId);
                  if (!relatedAnime) return null;
                  
                  return (
                    <div key={relatedId} className="flex">
                      <img 
                        src={relatedAnime.coverImage} 
                        alt={relatedAnime.title} 
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="ml-3">
                        <h4 className="font-medium text-sm line-clamp-2">{relatedAnime.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span>{relatedAnime.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {relatedAnime.episodes} Episodes
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4">
                Community Discussion
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-surface-light rounded-lg">
                  <h4 className="font-medium text-sm">Episode 5 Discussion</h4>
                  <p className="text-xs text-gray-400 mt-1">42 comments</p>
                </div>
                <div className="p-3 bg-surface-light rounded-lg">
                  <h4 className="font-medium text-sm">Character Analysis: Hiro</h4>
                  <p className="text-xs text-gray-400 mt-1">28 comments</p>
                </div>
                <div className="p-3 bg-surface-light rounded-lg">
                  <h4 className="font-medium text-sm">Season 2 Predictions</h4>
                  <p className="text-xs text-gray-400 mt-1">64 comments</p>
                </div>
              </div>
              <button className="w-full mt-4 text-center text-sm text-secondary hover:text-secondary-light">
                View All Discussions
              </button>
            </div>
            
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {["action", "adventure", "fantasy", "magic", "prophecy", "school", "supernatural", "friendship", "fighting"].map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-surface-light text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;