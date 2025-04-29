import React, { useState, useEffect } from 'react';
import { Search, Clock, Plus } from 'lucide-react';
import { collection, query, orderBy, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { NewsArticle } from '../types';
import NewsCard from '../components/ui/NewsCard';
import NewsArticleForm from '../components/ui/NewsArticleForm';
import { useAuthState } from 'react-firebase-hooks/auth';

const categories = ["All", "News", "Industry", "Reviews", "Interviews", "Features"];

const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const newsRef = collection(db, 'news');
        const q = query(newsRef, orderBy('publishDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const newsArticles = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const publishDate = data.publishDate instanceof Timestamp 
            ? data.publishDate.toDate().toISOString()
            : new Date().toISOString();

          return {
            id: parseInt(doc.id),
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            coverImage: data.coverImage || '',
            authorId: parseInt(data.authorId) || 0,
            authorName: data.authorName || '',
            authorAvatar: data.authorAvatar || '',
            category: data.category || 'News',
            publishDate,
            tags: Array.isArray(data.tags) ? data.tags : []
          } as NewsArticle;
        });
        
        setArticles(newsArticles);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch user role when user is logged in
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        return;
      }

      try {
        const userDoc = await getDocs(query(collection(db, 'users')));
        const userData = userDoc.docs.find(doc => doc.id === user.uid);
        setUserRole(userData?.data()?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  const filteredArticles = articles.filter(article => {
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (selectedCategory !== "All" && article.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  const refreshNews = async () => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('publishDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const newsArticles = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const publishDate = data.publishDate instanceof Timestamp 
        ? data.publishDate.toDate().toISOString()
        : new Date().toISOString();

      return {
        id: parseInt(doc.id),
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        coverImage: data.coverImage || '',
        authorId: parseInt(data.authorId) || 0,
        authorName: data.authorName || '',
        authorAvatar: data.authorAvatar || '',
        category: data.category || 'News',
        publishDate,
        tags: Array.isArray(data.tags) ? data.tags : []
      } as NewsArticle;
    });
    
    setArticles(newsArticles);
  };

  const handleArticleDelete = () => {
    refreshNews();
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-orbitron font-bold mb-2">
              <span className="gradient-text">Anime</span> News & Updates
            </h1>
            <p className="text-gray-400">The latest happenings in the anime world</p>
          </div>
          
          {userRole === 'writer' && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center space-x-2 px-4 py-2"
            >
              <Plus className="h-5 w-5" />
              <span>Post News</span>
            </button>
          )}
        </div>
        
        {showForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <NewsArticleForm
                onSuccess={() => {
                  setShowForm(false);
                  refreshNews();
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
        
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
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
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
                        <Clock className="h-4 w-4 mr-1" />
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
                <NewsCard 
                  key={article.id} 
                  article={article} 
                  userRole={userRole}
                  onDelete={handleArticleDelete}
                />
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
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;