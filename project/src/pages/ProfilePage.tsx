import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Settings, Heart, BookOpen, MessageSquare, 
  Clock, Award, ChevronRight, Edit, Shield, UserRound,
  Calendar, Star, Eye, BarChart3, Map, Bookmark, Zap
} from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AnimeCard from '../components/ui/AnimeCard';
import Badge from '../components/ui/Badge';
import { UserRole, User, Anime } from '../types';
import { useUserBadges } from '../hooks/useUserBadges';
import { motion } from 'framer-motion';
import Toast from '../components/ui/Toast';
import { ToastProvider, useToast } from '../components/ui/ToastContainer';
import FireBadge from '../components/ui/FireBadge';

interface UserStats {
  watching: number;
  completed: number;
  comments: number;
  reviews: number;
  threads: number;
  level: number;
  xp: number;
}

const getBadgeIcon = (role: UserRole) => {
  const iconClass = "transition-transform duration-300 group-hover:scale-125";
  
  switch (role) {
    case 'admin':
      return (
        <FireBadge>
          <Shield className={`h-5 w-5 text-primary ${iconClass}`} />
        </FireBadge>
      );
    case 'reviewer':
      return <Award className={`h-5 w-5 text-yellow-400 ${iconClass}`} />;
    case 'writer':
      return <MessageSquare className={`h-5 w-5 text-blue-400 ${iconClass}`} />;
    case 'user':
      return <UserRound className={`h-5 w-5 text-secondary ${iconClass}`} />;
    default:
      return null;
  }
};

const BASE64_FALLBACK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFuaW1lPC90ZXh0Pjwvc3ZnPg==";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("watchlist");
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState('');
  const [updating, setUpdating] = useState(false);
  const [bannerURL, setBannerURL] = useState('');
  const [updatingBanner, setUpdatingBanner] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    watching: 0,
    completed: 0,
    comments: 0,
    reviews: 0,
    threads: 0,
    level: 0,
    xp: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [completedAnime, setCompletedAnime] = useState<Anime[]>([]);
  const { username, userId } = useParams<{ username: string; userId: string }>();
  const { badges, loading: badgesLoading } = useUserBadges();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const waitForAuth = new Promise<void>((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
              unsubscribe();
              resolve();
            }
          });
        });

        await waitForAuth;

        // If userId is provided, fetch by userId directly
        if (userId) {
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            
            // Check if profile is hidden and the viewer is not the profile owner
            if (userData.profileHidden && auth.currentUser?.uid !== userData.id) {
              setError('This profile is hidden by the user');
              setLoading(false);
              return;
            }
            
            setUserData(userData);
            setAvatarURL(userData.avatar || '');
            setBannerURL(userData.banner || '');

            setStats({
              watching: userData.watchlist?.length || 0,
              completed: userData.stats?.completed || 0,
              comments: userData.stats?.comments || 0,
              reviews: userData.stats?.reviews || 0,
              threads: userData.stats?.threads || 0,
              level: userData.level || 0,
              xp: userData.xp || 0,
            });
          } else {
            setError('User data not found');
          }
          setLoading(false);
          return;
        }

        // If no username or userId is provided, use current user's data
        if (!username) {
          if (!auth.currentUser) {
            setError('No user is logged in');
            setLoading(false);
            return;
          }
          
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            
            // Check if profile is hidden and the viewer is not the profile owner
            if (userData.profileHidden && auth.currentUser?.uid !== userData.id) {
              setError('This profile is hidden by the user');
              setLoading(false);
              return;
            }
            
            setUserData(userData);
            setAvatarURL(userData.avatar || '');
            setBannerURL(userData.banner || '');

            setStats({
              watching: userData.watchlist?.length || 0,
              completed: userData.stats?.completed || 0,
              comments: userData.stats?.comments || 0,
              reviews: userData.stats?.reviews || 0,
              threads: userData.stats?.threads || 0,
              level: userData.level || 0,
              xp: userData.xp || 0,
            });
          } else {
            setError('User data not found');
          }
          setLoading(false);
          return;
        }

        // If username is provided, query by username
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          
          // Check if profile is hidden and the viewer is not the profile owner
          if (userData.profileHidden && auth.currentUser?.uid !== userData.id) {
            setError('This profile is hidden by the user');
            setLoading(false);
            return;
          }
          
          setUserData(userData);
          setAvatarURL(userData.avatar || '');
          setBannerURL(userData.banner || '');

          setStats({
            watching: userData.watchlist?.length || 0,
            completed: userData.stats?.completed || 0,
            comments: userData.stats?.comments || 0,
            reviews: userData.stats?.reviews || 0,
            threads: userData.stats?.threads || 0,
            level: userData.level || 0,
            xp: userData.xp || 0,
          });
        } else {
          setError('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, userId]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!auth.currentUser) return;

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (!userData?.watchlist) return;

      try {
        console.log("Fetching watchlist details for:", userData.watchlist);
        const animeDetails = await Promise.all(
          userData.watchlist.map(async (animeId: string) => {
            const animeDocRef = doc(db, 'anime', animeId);
            const animeSnapshot = await getDoc(animeDocRef);
            if (animeSnapshot.exists()) {
              const animeData = { id: animeId, ...animeSnapshot.data() } as Anime;
              console.log("Found anime:", animeId, animeData);
              
              // Always ensure there's a valid coverImage
              if (!animeData.coverImage) {
                console.warn(`Missing cover image for ${animeData.title}, using base64 fallback`);
                animeData.coverImage = BASE64_FALLBACK;
              }
              
              return animeData;
            } else {
              console.log("Anime not found:", animeId);
              // Return a minimal valid anime object with base64 image
              return {
                id: animeId,
                title: `Anime ${animeId}`,
                coverImage: BASE64_FALLBACK,
                episodes: 0,
                rating: 0,
                genres: ['Unknown'],
                description: 'No description available',
                status: 'Unknown' as any,
                releaseYear: 0
              } as Anime;
            }
          })
        );

        const validAnimeDetails = animeDetails.filter((anime): anime is Anime => anime !== null);
        console.log("Valid anime details:", validAnimeDetails);
        
        setUserData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            watchlistDetails: validAnimeDetails,
          };
        });
      } catch (error) {
        console.error('Error fetching watchlist details:', error);
      }
    };

    fetchWatchlistDetails();
  }, [userData?.watchlist]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!auth.currentUser) return;

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          
          // Set stats directly from the users collection
          setStats({
            watching: userData.watchlist?.length || 0, // from user's watchlist array
            completed: userData.completed?.length || 0, // Keep this for consistency
            comments: userData.stats?.comments || 0, // from stats.comments
            reviews: userData.stats?.reviews || 0, // Keep this for consistency
            threads: userData.stats?.threads || 0, // from stats.threads
            level: userData.level || 0, // directly from level field
            xp: userData.xp || 0, // directly from xp field
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats({
          watching: 0,
          completed: 0,
          comments: 0,
          reviews: 0,
          threads: 0,
          level: 0,
          xp: 0,
        });
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        
        // Update user data
        setUserData(prev => ({
          ...prev!,
          ...data,
          id: docSnapshot.id,
          watchlist: data.watchlist || [],
          completed: data.completed || [],
          level: data.level || 0,
          xp: data.xp || 0
        }));
        
        // Update stats from users collection fields
        setStats(prev => ({
          ...prev,
          watching: data.watchlist?.length || 0, // from watchlist array
          completed: data.completed?.length || 0,
          comments: data.stats?.comments || 0, // from stats.comments
          reviews: data.stats?.reviews || 0,
          threads: data.stats?.threads || 0, // from stats.threads
          level: data.level || 0, // from level field
          xp: data.xp || 0 // from xp field
        }));
      }
    });

    const threadsQuery = query(
      collection(db, 'forumThreads'),
      where('authorId', '==', auth.currentUser.uid)
    );

    const unsubscribeThreads = onSnapshot(threadsQuery, (querySnapshot) => {
      const threadsCount = querySnapshot.size;
      let commentsCount = 0;

      querySnapshot.forEach((doc) => {
        const threadData = doc.data();
        commentsCount += threadData.comments?.length || 0;
      });

      setStats((prevStats) => ({
        ...prevStats,
        threads: threadsCount,
        comments: commentsCount,
      }));
    });

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('authorId', '==', auth.currentUser.uid)
    );

    const unsubscribeReviews = onSnapshot(reviewsQuery, (querySnapshot) => {
      const reviewsCount = querySnapshot.size;

      setStats((prevStats) => ({
        ...prevStats,
        reviews: reviewsCount,
      }));
    });

    return () => {
      unsubscribeUser();
      unsubscribeThreads();
      unsubscribeReviews();
    };
  }, []);

  useEffect(() => {
    const fetchCompletedAnime = async () => {
      if (!userData?.completed) return;

      try {
        console.log("Fetching completed anime details for:", userData.completed);
        const animeDetails = await Promise.all(
          userData.completed.map(async (animeId: string) => {
            const animeDocRef = doc(db, 'anime', animeId);
            const animeSnapshot = await getDoc(animeDocRef);
            if (animeSnapshot.exists()) {
              const animeData = { id: animeId, ...animeSnapshot.data() } as Anime;
              console.log("Found completed anime:", animeId, animeData);
              
              // Always ensure there's a valid coverImage
              if (!animeData.coverImage) {
                console.warn(`Missing cover image for ${animeData.title}, using base64 fallback`);
                animeData.coverImage = BASE64_FALLBACK;
              }
              
              return animeData;
            } else {
              console.log("Completed anime not found:", animeId);
              // Return a minimal valid anime object with base64 image
              return {
                id: animeId,
                title: `Anime ${animeId}`,
                coverImage: BASE64_FALLBACK,
                episodes: 0,
                rating: 0,
                genres: ['Unknown'],
                description: 'No description available',
                status: 'Unknown' as any,
                releaseYear: 0
              } as Anime;
            }
          })
        );

        const validAnimeDetails = animeDetails.filter((anime): anime is Anime => anime !== null);
        console.log("Valid completed anime details:", validAnimeDetails);
        setCompletedAnime(validAnimeDetails);
      } catch (error) {
        console.error('Error fetching completed anime details:', error);
      }
    };

    fetchCompletedAnime();
  }, [userData?.completed]);

  useEffect(() => {
    const checkAnimeData = async () => {
      try {
        const animeCollectionRef = collection(db, 'anime');
        const animeSnapshot = await getDocs(animeCollectionRef);
        
        console.log(`Found ${animeSnapshot.size} anime in the database`);
        
        if (animeSnapshot.size === 0) {
          console.error("No anime data found in the database!");
          
          // Add sample anime data with embedded base64 images
          const sampleAnimeData = [
            {
              id: "jujutsu-kaisen",
              title: "Jujutsu Kaisen",
              description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
              coverImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkp1anV0c3UgS2Fpc2VuPC90ZXh0Pjwvc3ZnPg==",
              bannerImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSI+SnVqdXRzdSBLYWlzZW48L3RleHQ+PC9zdmc+",
              episodes: 24,
              rating: 8.7,
              releaseYear: 2020,
              genres: ["Action", "Fantasy", "School", "Shounen", "Supernatural"],
              status: "Completed",
              studio: "MAPPA",
              seasons: [
                { name: "Season 1", episodes: 24 }
              ]
            },
            {
              id: "demon-slayer",
              title: "Demon Slayer",
              description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
              coverImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkRlbW9uIFNsYXllcjwvdGV4dD48L3N2Zz4=",
              bannerImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSI+RGVtb24gU2xheWVyPC90ZXh0Pjwvc3ZnPg==",
              episodes: 26,
              rating: 8.9,
              releaseYear: 2019,
              genres: ["Action", "Fantasy", "Historical", "Shounen", "Supernatural"],
              status: "Completed",
              studio: "ufotable",
              seasons: [
                { name: "Season 1", episodes: 26 }
              ]
            },
            {
              id: "attack-on-titan",
              title: "Attack on Titan",
              description: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
              coverImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkF0dGFjayBvbiBUaXRhbjwvdGV4dD48L3N2Zz4=",
              bannerImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFhMTAzYyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMWExMDNjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSI+QXR0YWNrIG9uIFRpdGFuPC90ZXh0Pjwvc3ZnPg==",
              episodes: 25,
              rating: 8.5,
              releaseYear: 2013,
              genres: ["Action", "Drama", "Fantasy", "Shounen", "Supernatural"],
              status: "Completed",
              studio: "Wit Studio",
              seasons: [
                { name: "Season 1", episodes: 25 }
              ]
            }
          ];
          
          console.log("Testing sample anime image URLs...");
          
          // Test all image URLs
          for (const anime of sampleAnimeData) {
            // Just log the image URLs without testing them
            console.log(`Using image for ${anime.title}: ${anime.coverImage.substring(0, 50)}...`);
          }
          
          console.log("Adding sample anime data to the database...");
          
          try {
            await Promise.all(sampleAnimeData.map(async (anime) => {
              const animeRef = doc(db, 'anime', anime.id);
              await setDoc(animeRef, anime);
              console.log(`Added anime: ${anime.title}`);
            }));
            
            console.log("Sample anime data added successfully!");
            
            // If the user has a watchlist but no anime in the database,
            // add these sample anime to their watchlist
            if (userData && auth.currentUser && userData.watchlist?.length === 0) {
              const userRef = doc(db, 'users', auth.currentUser.uid);
              await updateDoc(userRef, {
                watchlist: sampleAnimeData.map(anime => anime.id)
              });
              console.log("Added sample anime to user's watchlist");
            }
          } catch (error) {
            console.error("Error adding sample anime data:", error);
          }
        } else {
          console.log("First few anime:", animeSnapshot.docs.slice(0, 3).map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        }
      } catch (error) {
        console.error("Error checking anime data:", error);
      }
    };
    
    checkAnimeData();
  }, [userData]);

  useEffect(() => {
    if (userData) {
      console.log("userData updated:", {
        id: userData.id,
        username: userData.username,
        watchlist: userData.watchlist,
        watchlistDetails: userData.watchlistDetails,
        completed: userData.completed
      });
    }
  }, [userData]);

  const handleAvatarUpdate = async () => {
    if (!avatarURL.trim()) {
      showToast('Please provide a valid avatar URL.', 'error');
      return;
    }
    try {
      setUpdating(true);
      setImageError(null);
      
      // Validate image URL
      const img = new Image();
      img.src = avatarURL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Invalid image URL'));
      });

      const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userDocRef, { avatar: avatarURL });
      setUserData((prev) => ({ ...prev!, avatar: avatarURL }));
      
      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating avatar:', error);
      showToast('Failed to update avatar. Please provide a valid image URL.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleBannerUpdate = async () => {
    if (!bannerURL.trim()) {
      showToast('Please provide a valid banner URL.', 'error');
      return;
    }
    try {
      setUpdatingBanner(true);
      setImageError(null);
      
      // Validate image URL
      const img = new Image();
      img.src = bannerURL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Invalid image URL'));
      });

      const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userDocRef, { banner: bannerURL });
      setUserData((prev) => ({ ...prev!, banner: bannerURL }));
      
      showToast('Banner updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating banner:', error);
      showToast('Failed to update banner. Please provide a valid image URL.', 'error');
    } finally {
      setUpdatingBanner(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!userData?.username.trim()) {
      showToast('Please provide a valid username.', 'error');
      return;
    }
    try {
      setUpdating(true);

      // Update username in Firestore
      const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userDocRef, { username: userData.username });

      // Update display name in Firebase Authentication
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: userData.username });
      }

      // Update localStorage
      const updatedUserData = { ...userData, username: userData.username };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      showToast('Username updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating username:', error);
      showToast('Failed to update username. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-secondary border-b-transparent rounded-full animate-spin animate-delay-150"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mt-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Loading profile...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center p-12 bg-surface rounded-xl shadow-lg shadow-red-500/10 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              {error.includes('hidden') ? (
                <Eye className="h-10 w-10 text-secondary" />
              ) : (
                <UserIcon className="h-10 w-10 text-red-500" />
              )}
            </div>
            <h1 className={`text-2xl font-bold mb-4 ${error.includes('hidden') ? 'text-secondary' : 'text-red-500'}`}>
              {error.includes('hidden') ? 'Profile Hidden' : 'Profile Error'}
            </h1>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-6 px-6 py-3 bg-surface-light hover:bg-surface-dark transition-colors rounded-xl text-white font-medium"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400">No profile data available</h1>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = auth.currentUser?.uid === userData?.id;

  // Calculate XP percentage for the progress bar
  const xpPercentage = (stats.xp % 1000) / 10;
  const remainingXP = 1000 - (stats.xp % 1000);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Enhanced Profile Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-surface rounded-2xl overflow-hidden mb-8 shadow-lg"
        >
          <div 
            className="h-48 bg-gradient-to-r from-primary/40 to-secondary/40 relative" 
            style={{
              backgroundImage: `url('${userData.banner || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'}')`,
              backgroundSize: 'cover',
              backgroundBlendMode: 'overlay',
              backgroundPosition: 'center'
            }}
          >
            {isOwnProfile && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  className="bg-surface/40 backdrop-blur-sm p-2.5 rounded-lg text-white hover:bg-surface/60 transition-all hover:scale-105"
                  title="Change banner image"
                  onClick={() => {
                    const url = prompt('Enter banner image URL:');
                    if (url) {
                      setBannerURL(url);
                      handleBannerUpdate();
                    }
                  }}
                >
                  {updatingBanner ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Edit className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
          </div>

          <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center relative">
            <div className="absolute -top-20 left-6 h-32 w-32 rounded-full border-4 border-surface overflow-hidden shadow-xl">
              <img 
                src={userData.avatar || 'https://via.placeholder.com/150'} 
                alt={userData.username} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150';
                }}
              />
              {isOwnProfile && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                  onClick={() => {
                    const url = prompt('Enter avatar image URL:');
                    if (url) {
                      setAvatarURL(url);
                      handleAvatarUpdate();
                    }
                  }}
                >
                  {updating ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Edit className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-transform group-hover:scale-110" />
                  )}
                </div>
              )}
            </div>

            <div className="mt-14 md:mt-0 md:ml-36">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  {userData.username}
                </h1>
                {userData.profileHidden && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded-full">
                    <Eye className="h-4 w-4 text-secondary" />
                    <span className="text-xs text-secondary font-medium">Hidden Profile</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {badgesLoading ? (
                    <div className="w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
                  ) : badges && badges.length > 0 ? (
                    <div className="flex gap-2 items-center">
                      {badges.map((badge) => (
                        <motion.div 
                          key={badge.id || badge.name} 
                          className="group"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Badge 
                            badge={badge} 
                            size="sm"
                          >
                            {getBadgeIcon(badge.name as UserRole)}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center text-gray-300 text-sm mt-1 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  <span>Level {stats.level}</span>
                </div>
              </div>
            </div>

            <div className="flex mt-6 md:mt-0 md:ml-auto space-x-3">
              {isOwnProfile && (
                <button 
                  className="btn-ghost py-2 px-6 flex items-center space-x-2 bg-surface-dark/50 hover:bg-surface-light rounded-xl transition-all transform hover:scale-105"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              )}
              <button className="btn-primary py-2 px-6 flex items-center space-x-2 rounded-xl transform hover:scale-105 transition-all">
                <Zap className="h-4 w-4" />
                <span>Premium</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Enhanced Stats Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-secondary" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Stats</span>
              </h3>

              {/* XP Progress */}
              <div className="mb-6 bg-surface-dark p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Level {stats.level}</span>
                  <span className="text-secondary font-bold">{stats.xp} XP</span>
                </div>
                <div className="h-3 bg-surface-light rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{xpPercentage.toFixed(0)}% complete</span>
                  <span>{remainingXP} XP until next level</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="group bg-surface-dark hover:bg-surface-light transition-colors p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <span className="ml-3">Watching</span>
                  </div>
                  <span className="text-white font-semibold">{stats.watching}</span>
                </div>
                
                <div className="group bg-surface-dark hover:bg-surface-light transition-colors p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Heart className="h-5 w-5 text-accent" />
                    </div>
                    <span className="ml-3">Completed</span>
                  </div>
                  <span className="text-white font-semibold">{stats.completed}</span>
                </div>
                
                <div className="group bg-surface-dark hover:bg-surface-light transition-colors p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="ml-3">Comments</span>
                  </div>
                  <span className="text-white font-semibold">{stats.comments}</span>
                </div>
                
                <div className="group bg-surface-dark hover:bg-surface-light transition-colors p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <div className="p-2 rounded-lg bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors">
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span className="ml-3">Reviews</span>
                  </div>
                  <span className="text-white font-semibold">{stats.reviews}</span>
                </div>

                <div className="group bg-surface-dark hover:bg-surface-light transition-colors p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center text-gray-300">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <span className="ml-3">Threads</span>
                  </div>
                  <span className="text-white font-semibold">{stats.threads}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Badges Section */}
            <div className="bg-surface rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Badges</span>
              </h3>
              
              {badgesLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
                </div>
              ) : badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <motion.div 
                      key={badge.id || badge.name} 
                      className="group bg-surface-dark p-3 rounded-xl flex flex-col items-center justify-center transform hover:scale-105 hover:shadow-md hover:shadow-primary/10 transition-all"
                      whileHover={{ y: -3 }}
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-2 group-hover:from-primary/50 group-hover:to-secondary/50 transition-all">
                        {getBadgeIcon(badge.name as UserRole)}
                      </div>
                      <span className="text-white text-sm font-medium">{badge.name}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-surface-dark rounded-xl">
                  <Award className="h-10 w-10 text-gray-600 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400">No badges earned yet</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Enhanced Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Enhanced Tabs Navigation */}
            <div className="flex justify-center mb-8 bg-surface rounded-2xl p-2 shadow-lg">
              <div className="flex space-x-2 w-full">
                {[
                  { id: 'watchlist', label: 'Watchlist', icon: <Bookmark className="h-4 w-4 mr-2" /> },
                  { id: 'activity', label: 'Activity', icon: <Clock className="h-4 w-4 mr-2" /> },
                  { id: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4 mr-2" /> },
                  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white font-medium shadow-md' 
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-surface-light'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="bg-surface rounded-2xl p-6 shadow-lg">
              {activeTab === 'watchlist' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold flex items-center">
                      <Bookmark className="h-5 w-5 mr-2 text-primary" />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        My Watchlist
                      </span>
                    </h2>
                    <button className="text-secondary text-sm flex items-center bg-surface-dark hover:bg-surface-light transition-all px-4 py-2 rounded-lg">
                      <span>View all</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  {userData.watchlistDetails && userData.watchlistDetails.length > 0 ? (
                    <>
                      <div className="mb-4 p-2 bg-surface-dark rounded-lg">
                        <p className="text-sm text-gray-400">
                          Found {userData.watchlistDetails.length} anime in your watchlist
                        </p>
                      </div>
                      <div className="overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex flex-nowrap gap-4 min-w-max">
                          {userData.watchlistDetails.map((anime, index) => {
                            // Ensure anime has all required properties
                            const safeAnime = {
                              ...anime,
                              id: anime.id || `anime-${index}`,
                              title: anime.title || 'Unknown Anime',
                              coverImage: anime.coverImage || BASE64_FALLBACK,
                              episodes: anime.episodes || 0,
                              rating: anime.rating || 0,
                              genres: anime.genres || ['Unknown'],
                              description: anime.description || '',
                            };
                            
                            return (
                              <div 
                                key={safeAnime.id} 
                                className="w-[169px] h-[295px] flex-shrink-0" 
                              >
                                <AnimeCard anime={safeAnime} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-surface-dark rounded-xl p-8 text-center">
                      <Bookmark className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
                      <p className="text-gray-400 mb-6">
                        Start adding shows to your watchlist to keep track of what you want to watch.
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Debug info: watchlist: {userData.watchlist ? userData.watchlist.length : 0} items, 
                        watchlistDetails: {userData.watchlistDetails ? userData.watchlistDetails.length : 0} items
                      </p>
                      <Link to="/anime" className="btn-primary py-2 px-6 inline-block rounded-xl">
                        Browse Anime
                      </Link>
                    </div>
                  )}
                  
                  {completedAnime.length > 0 && (
                    <div className="mt-12">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-accent" />
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                            Recently Completed
                          </span>
                        </h2>
                        <button className="text-secondary text-sm flex items-center bg-surface-dark hover:bg-surface-light transition-all px-4 py-2 rounded-lg">
                          <span>View all</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex flex-nowrap gap-4 min-w-max">
                          {completedAnime.slice(0, 4).map((anime, index) => {
                            // Ensure anime has all required properties
                            const safeAnime = {
                              ...anime,
                              id: anime.id || `completed-${index}`,
                              title: anime.title || 'Unknown Anime',
                              coverImage: anime.coverImage || BASE64_FALLBACK,
                              episodes: anime.episodes || 0,
                              rating: anime.rating || 0,
                              genres: anime.genres || ['Unknown'],
                              description: anime.description || '',
                            };
                            
                            return (
                              <div 
                                key={safeAnime.id} 
                                className="w-[169px] h-[295px] flex-shrink-0" 
                              >
                                <AnimeCard anime={safeAnime} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold mb-8 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-secondary" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      Recent Activity
                    </span>
                  </h2>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface-dark p-4 rounded-xl flex items-start space-x-4 hover:bg-surface-light transition-all"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {i % 3 === 0 ? <Heart className="h-5 w-5 text-accent" /> : 
                           i % 3 === 1 ? <MessageSquare className="h-5 w-5 text-secondary" /> :
                           <Star className="h-5 w-5 text-yellow-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">
                            {i % 3 === 0 ? 'Added "Attack on Titan" to watchlist' : 
                             i % 3 === 1 ? 'Commented on "Demon Slayer" discussion' :
                             'Rated "My Hero Academia" 5 stars'}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{i === 0 ? 'Just now' : i === 1 ? '3 hours ago' : '2 days ago'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-8 py-3 text-center text-secondary border border-secondary/30 rounded-xl hover:bg-secondary/10 transition-colors">
                    Load More Activity
                  </button>
                </motion.div>
              )}
              
              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                    <MessageSquare className="h-10 w-10 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-medium mb-4">No reviews yet</h3>
                  <p className="text-gray-400 mb-8 max-w-md text-center">
                    Share your thoughts on anime by writing reviews and help others discover great shows.
                  </p>
                  {userData?.badges?.some((badge) => badge.name === 'reviewer' || userData.role === 'admin') ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-primary to-secondary py-3 px-8 rounded-xl text-white font-medium shadow-lg shadow-primary/20"
                    >
                      Write Your First Review
                    </motion.button>
                  ) : (
                    <div className="bg-surface-dark p-4 rounded-xl text-center">
                      <p className="text-gray-300">
                        <span className="text-secondary font-medium">Reviewer badge</span> required to write reviews
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'settings' && isOwnProfile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold mb-8 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      Account Settings
                    </span>
                  </h2>
                  
                  <div className="space-y-8">
                    <div className="bg-surface-dark p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-6 text-secondary">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                          <input 
                            type="text" 
                            className="w-full bg-surface p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-light"
                            value={userData.username}
                            onChange={(e) => setUserData((prev) => ({ ...prev!, username: e.target.value }))}
                          />
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary py-2 px-6 mt-2 rounded-xl"
                            onClick={handleUsernameUpdate}
                            disabled={updating}
                          >
                            {updating ? 'Applying...' : 'Apply Changes'}
                          </motion.button>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          <input 
                            type="email" 
                            className="w-full bg-surface p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-light"
                            value={userData.email}
                            disabled
                          />
                          <p className="text-xs text-gray-400 mt-2">Email changes require verification</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-surface-dark p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-6 text-secondary">Profile Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Avatar Settings */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img 
                                src={userData.avatar || 'https://via.placeholder.com/150'} 
                                alt={userData.username} 
                                className="w-24 h-24 rounded-full object-cover border-4 border-surface"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/150';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <Edit className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-1">Avatar URL</label>
                              <input 
                                type="text" 
                                className="w-full bg-surface p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-light"
                                value={avatarURL}
                                onChange={(e) => setAvatarURL(e.target.value)}
                                placeholder="Enter avatar URL"
                              />
                              {imageError && (
                                <p className="text-red-500 text-sm mt-1">{imageError}</p>
                              )}
                            </div>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary py-2 px-6 rounded-xl w-full"
                            onClick={handleAvatarUpdate}
                            disabled={updating}
                          >
                            {updating ? 'Updating...' : 'Update Avatar'}
                          </motion.button>
                        </div>

                        {/* Banner Settings */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative group w-24 h-24 overflow-hidden rounded-xl">
                              <img 
                                src={userData.banner || 'https://via.placeholder.com/1500'} 
                                alt="Profile banner" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/1500';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-300 mb-1">Banner URL</label>
                              <input 
                                type="text" 
                                className="w-full bg-surface p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-light"
                                value={bannerURL}
                                onChange={(e) => setBannerURL(e.target.value)}
                                placeholder="Enter banner URL"
                              />
                            </div>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary py-2 px-6 rounded-xl w-full"
                            onClick={handleBannerUpdate}
                            disabled={updatingBanner}
                          >
                            {updatingBanner ? 'Updating...' : 'Update Banner'}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-surface-dark p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-6 text-secondary">Password</h3>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-surface hover:bg-surface-light py-3 px-6 rounded-xl text-white transition-colors"
                      >
                        Change Password
                      </motion.button>
                    </div>
                    
                    <div className="bg-surface-dark p-6 rounded-xl">
                      <h3 className="text-lg font-medium mb-6 text-secondary">Privacy Settings</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Hide My Profile</h4>
                          <p className="text-sm text-gray-400 mt-1">When enabled, your profile will not be visible to other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={userData.profileHidden || false}
                            onChange={async () => {
                              try {
                                const newHiddenValue = !userData.profileHidden;
                                const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
                                await updateDoc(userDocRef, { profileHidden: newHiddenValue });
                                setUserData((prev) => ({ ...prev!, profileHidden: newHiddenValue }));
                                showToast(
                                  newHiddenValue 
                                    ? 'Your profile is now hidden from other users' 
                                    : 'Your profile is now visible to other users', 
                                  'success'
                                );
                              } catch (error) {
                                console.error('Error updating profile visibility:', error);
                                showToast('Failed to update profile visibility', 'error');
                              }
                            }}
                          />
                          <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-800 flex justify-end">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-primary to-secondary py-3 px-8 rounded-xl text-white font-medium shadow-lg shadow-primary/20"
                      >
                        Save All Changes
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;