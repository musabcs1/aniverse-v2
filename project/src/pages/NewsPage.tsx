import React, { useState } from 'react';
import { Search, Calendar, Tag } from 'lucide-react';
import NewsCard from '../components/ui/NewsCard';
import { NewsArticle } from '../types';

// Sample data
const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Celestial Legends Announces Second Season",
    excerpt: "Fan-favorite series confirms return with new characters and expanded world-building.",
    content: "Aniverse Studios has officially announced that their hit series 'Celestial Legends' will return for a second season in early 2026. Following the massive success of season one, which concluded this spring, the studio has fast-tracked production for the next chapter. The announcement came during a special livestream event where key visual art and a brief teaser were revealed, showcasing new characters and locations. According to series director Hiroshi Tanaka, the new season will expand the world beyond Earth as Hiro and his companions venture into the celestial realm to confront powerful new enemies. The studio has confirmed that all main cast members will return, with several high-profile voice actors joining for new roles. Pre-production is already underway, with animation work scheduled to begin this summer.",
    coverImage: "https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg",
    authorId: 1,
    authorName: "Aki Tanaka",
    authorAvatar: "https://i.pravatar.cc/150?img=32",
    category: "News",
    publishDate: "2025-04-15",
    tags: ["announcement", "sequel", "fantasy"]
  },
  {
    id: 2,
    title: "Behind the Animation: Cyber Nexus 2099",
    excerpt: "An exclusive look at the groundbreaking animation techniques used in the cyberpunk thriller.",
    content: "In our latest behind-the-scenes feature, we take an in-depth look at the revolutionary animation techniques that brought 'Cyber Nexus 2099' to life. The cyberpunk thriller, which has been praised for its stunning visuals and fluid action sequences, utilized a unique blend of traditional 2D animation and cutting-edge 3D rendering to create its distinctive aesthetic. Lead animator Keiko Yamada explains how her team developed custom software to achieve the neon-lit cityscape and dynamic character movements that have become the series' visual signature. 'We wanted to honor the tradition of hand-drawn animation while pushing the boundaries of what's possible with new technology,' Yamada states in our exclusive interview. The article also explores how the show's distinctive lighting effects were achieved, the challenge of animating complex motorcycle chase sequences, and the careful color design that reinforces the show's themes of technology and humanity.",
    coverImage: "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg",
    authorId: 2,
    authorName: "Marcus Chen",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    category: "Industry",
    publishDate: "2025-04-10",
    tags: ["animation", "technology", "interview"]
  },
  {
    id: 3,
    title: "Voice Actor Spotlight: Yuki Kaji",
    excerpt: "Industry veteran discusses his upcoming roles and reflections on his legendary career.",
    content: "Legendary voice actor Yuki Kaji sits down with Aniverse for an exclusive interview covering his illustrious career and exciting upcoming projects. With over two decades in the industry and dozens of iconic roles to his name, Kaji reflects on how the voice acting profession has evolved and the characters that have meant the most to him personally. 'Every role teaches me something new about myself,' Kaji explains. He discusses the unique challenges of his recent performance in 'Celestial Legends' and teases his involvement in several major upcoming series. The interview also touches on his voice acting techniques, how he prepares for emotionally demanding scenes, and his thoughts on the increasing global recognition of Japanese voice actors. Fans will be particularly excited to learn about his upcoming voice acting workshop series aimed at nurturing new talent in the industry. The full interview includes exclusive photos from Kaji's recording sessions and personal insights into his creative process.",
    coverImage: "https://images.pexels.com/photos/7383469/pexels-photo-7383469.jpeg",
    authorId: 3,
    authorName: "Emma Stone",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    category: "Industry",
    publishDate: "2025-04-07",
    tags: ["voice-actor", "interview", "career"]
  },
  {
    id: 4,
    title: "Spring 2025 Anime Season Preview",
    excerpt: "Our comprehensive guide to all the exciting new series coming this season.",
    content: "Spring is here, and with it comes a fresh lineup of anime series to captivate viewers. Our comprehensive season preview breaks down all the notable new shows and returning favorites scheduled to air in Spring 2025. From highly anticipated adaptations of popular manga to original productions from top studios, this season promises something for every anime fan. The guide highlights key staff members, voice actors, and premiere dates for each series, along with our expert commentary on which shows might become the breakout hits of the season. Notable premieres include 'Quantum Blade,' a sci-fi thriller from the creators of 'Cyber Nexus 2099'; 'Bakery Days,' a heartwarming slice-of-life comedy; and 'Chronicle of the Demon King,' an epic fantasy adaptation of the bestselling light novel series. We also discuss the continuation of popular shows entering new seasons and analyze the emerging trends in this season's offerings. Whether you're looking for action, romance, comedy, or drama, our guide will help you plan your watching schedule for the exciting months ahead.",
    coverImage: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
    authorId: 4,
    authorName: "Jason Lee",
    authorAvatar: "https://i.pravatar.cc/150?img=8",
    category: "News",
    publishDate: "2025-04-01",
    tags: ["season-preview", "upcoming", "guide"]
  },
  {
    id: 5,
    title: "Anime Industry Report: Streaming Services Reshape Global Distribution",
    excerpt: "Analysis of how streaming platforms are changing anime production and international reach.",
    content: "Our latest industry analysis examines the profound impact streaming services have had on anime production, distribution, and consumption worldwide. With global platforms investing billions in exclusive content and international licensing, the traditional anime business model continues to evolve at a rapid pace. The report includes interviews with studio executives, distribution specialists, and industry analysts who provide insights into how these changes are affecting everything from production budgets to creative decisions. Statistical data shows remarkable growth in international viewership, with anime consumption outside Japan increasing by 38% over the past two years. We explore how this expanded global audience is influencing content creation, with studios increasingly considering international preferences while maintaining the medium's Japanese cultural identity. The article also addresses concerns about working conditions in the animation industry and how increased revenue streams might potentially improve compensation for animators. With additional sections covering emerging markets, changing release strategies, and predictions for the industry's future, this comprehensive report provides valuable context for understanding anime's evolving global presence.",
    coverImage: "https://images.pexels.com/photos/459791/pexels-photo-459791.jpeg",
    authorId: 5,
    authorName: "Sophia Rodriguez",
    authorAvatar: "https://i.pravatar.cc/150?img=20",
    category: "Industry",
    publishDate: "2025-03-25",
    tags: ["industry", "business", "streaming"]
  },
  {
    id: 6,
    title: "Samurai's Honor Wins Best Animation at Global Film Festival",
    excerpt: "Historical drama receives international recognition for outstanding artistic achievement.",
    content: "In a landmark achievement for anime cinema, 'Samurai's Honor' has been awarded the Best Animation prize at the prestigious Global Film Festival. The historical drama, directed by renowned filmmaker Takashi Yamamoto, was praised by judges for its stunning visual style, emotional depth, and faithful representation of feudal Japan. This marks only the third time in the festival's 45-year history that an anime production has received this honor. The film's meticulous hand-drawn animation, which blends traditional techniques with subtle digital enhancements, was singled out for particular acclaim. In his acceptance speech, director Yamamoto dedicated the award to his animation team, noting that over 100 artists worked for three years to bring the film to life. The win is expected to significantly boost the film's international distribution, with several major territories finalizing theatrical release plans following the festival. Critics are already discussing 'Samurai's Honor' as a potential contender for next year's Academy Awards, which would represent another major step forward for anime's recognition in global cinema.",
    coverImage: "https://images.pexels.com/photos/5486845/pexels-photo-5486845.jpeg",
    authorId: 6,
    authorName: "Daniel Park",
    authorAvatar: "https://i.pravatar.cc/150?img=4",
    category: "News",
    publishDate: "2025-03-18",
    tags: ["awards", "film-festival", "historical"]
  }
];

const categories = ["All", "News", "Industry", "Reviews", "Interviews", "Features"];

const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const filteredArticles = newsArticles.filter(article => {
    // Search filter
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) && !article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== "All" && article.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-orbitron font-bold mb-2">
          <span className="gradient-text">Anime</span> News & Updates
        </h1>
        <p className="text-gray-400 mb-8">The latest happenings in the anime world</p>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search news..." 
                className="w-full bg-surface py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            
            <select 
              className="bg-surface py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Featured Article */}
        {filteredArticles.length > 0 && (
          <div className="mb-12">
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={filteredArticles[0].coverImage} 
                alt={filteredArticles[0].title} 
                className="w-full h-[50vh] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 text-sm rounded-full bg-accent text-white">
                    {filteredArticles[0].category}
                  </span>
                  <span className="text-gray-300 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(filteredArticles[0].publishDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-orbitron font-bold text-white mb-3">
                  {filteredArticles[0].title}
                </h2>
                
                <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                  {filteredArticles[0].excerpt}
                </p>
                
                <div className="flex items-center">
                  <img 
                    src={filteredArticles[0].authorAvatar} 
                    alt={filteredArticles[0].authorName} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-white font-medium">{filteredArticles[0].authorName}</p>
                    <p className="text-gray-400 text-sm">Staff Writer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.slice(1).map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
        
        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No news articles found matching your criteria</p>
            <button 
              className="btn-primary mt-4"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* Pagination */}
        {filteredArticles.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <button className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center text-gray-400 hover:bg-surface-light">
                &lt;
              </button>
              <button className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
                1
              </button>
              <button className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center text-gray-400 hover:bg-surface-light">
                2
              </button>
              <button className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center text-gray-400 hover:bg-surface-light">
                3
              </button>
              <button className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center text-gray-400 hover:bg-surface-light">
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;