import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, 
  Bell, Clock, ArrowRight, User
} from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { ForumThread } from '../types';

const ForumThreadDetailPage: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId) return;
      
      try {
        setLoading(true);
        const threadRef = doc(db, 'forumThreads', threadId);
        const threadDoc = await getDoc(threadRef);
        
        if (threadDoc.exists()) {
          const threadData = {
            id: threadDoc.id,
            ...threadDoc.data(),
            createdAt: threadDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: threadDoc.data().updatedAt?.toDate() || new Date(),
          } as ForumThread;
          
          setThread(threadData);
        } else {
          alert('Thread not found');
          navigate('/forum');
        }
      } catch (error) {
        console.error('Error fetching thread:', error);
        alert('Failed to load thread');
      } finally {
        setLoading(false);
      }
    };
    
    fetchThread();
  }, [threadId, navigate]);

  const handleLike = async () => {
    if (!auth.currentUser || !thread) return;
    
    try {
      const threadRef = doc(db, 'forumThreads', thread.id);
      const isLiked = thread.upvotes.includes(auth.currentUser.uid);
      
      await updateDoc(threadRef, {
        upvotes: isLiked 
          ? arrayRemove(auth.currentUser.uid) 
          : arrayUnion(auth.currentUser.uid)
      });
      
      setThread(prev => {
        if (!prev) return prev;
        
        const newUpvotes = isLiked
          ? prev.upvotes.filter(id => id !== auth.currentUser!.uid)
          : [...prev.upvotes, auth.currentUser!.uid];
          
        return {
          ...prev,
          upvotes: newUpvotes
        };
      });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDislike = async () => {
    if (!auth.currentUser || !thread) return;
    
    try {
      const threadRef = doc(db, 'forumThreads', thread.id);
      const isDisliked = thread.downvotes.includes(auth.currentUser.uid);
      
      await updateDoc(threadRef, {
        downvotes: isDisliked 
          ? arrayRemove(auth.currentUser.uid) 
          : arrayUnion(auth.currentUser.uid)
      });
      
      setThread(prev => {
        if (!prev) return prev;
        
        const newDownvotes = isDisliked
          ? prev.downvotes.filter(id => id !== auth.currentUser!.uid)
          : [...prev.downvotes, auth.currentUser!.uid];
          
        return {
          ...prev,
          downvotes: newDownvotes
        };
      });
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  const handleAddComment = async () => {
    if (!auth.currentUser || !thread || !comment.trim()) return;
    
    try {
      setSubmitting(true);
      
      const commentData = {
        content: comment.trim(),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        threadId: thread.id
      };
      
      // Add comment to comments collection
      const commentRef = collection(db, 'comments');
      const docRef = await addDoc(commentRef, commentData);
      
      // Update thread with comment
      const threadRef = doc(db, 'forumThreads', thread.id);
      await updateDoc(threadRef, {
        comments: arrayUnion({
          id: docRef.id,
          ...commentData,
          createdAt: new Date()
        }),
        replies: increment(1)
      });
      
      // Update user's XP and stats
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      await updateDoc(userRef, {
        'stats.comments': increment(1),
        xp: increment(5),
        level: Math.floor((userData.xp + 5) / 1000) + 1
      });
      
      // Update local state
      setThread(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          comments: [
            ...prev.comments,
            {
              id: docRef.id,
              content: comment.trim(),
              authorId: auth.currentUser!.uid,
              authorName: auth.currentUser!.displayName || 'Anonymous',
              createdAt: new Date()
            }
          ],
          replies: prev.replies + 1
        };
      });
      
      setComment('');
      alert('Comment added successfully! You earned 5 XP.');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!auth.currentUser || !thread) return;
    
    try {
      const threadRef = doc(db, 'forumThreads', thread.id);
      await updateDoc(threadRef, { reported: true });
      alert('Thread reported successfully.');
    } catch (error) {
      console.error('Error reporting thread:', error);
      alert('Failed to report thread');
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Thread not found</h2>
            <Link to="/forum" className="btn-primary mt-4 inline-block">Return to Forum</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <button 
          onClick={() => navigate('/forum')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Forum
        </button>
        
        {/* Thread header */}
        <div className="bg-surface rounded-xl p-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{thread.title}</h1>
          
          <div className="flex items-center mb-6">
            <img 
              src={thread.authorAvatar || 'https://via.placeholder.com/40'} 
              alt={thread.authorName} 
              className="w-10 h-10 rounded-full mr-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => navigate(`/profile/${thread.authorName}`)}
            />
            <div>
              <div 
                className="font-medium hover:text-primary cursor-pointer transition-colors"
                onClick={() => navigate(`/profile/${thread.authorName}`)}
              >
                {thread.authorName}
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(thread.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-gray-200 whitespace-pre-line">{thread.content}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {thread.tags && thread.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center space-x-6 text-sm border-t border-gray-700 pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                auth.currentUser && thread.upvotes.includes(auth.currentUser.uid) 
                  ? 'text-secondary' 
                  : 'text-gray-400 hover:text-secondary'
              } transition-colors`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>{thread.upvotes.length}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center space-x-1 ${
                auth.currentUser && thread.downvotes.includes(auth.currentUser.uid) 
                  ? 'text-accent' 
                  : 'text-gray-400 hover:text-accent'
              } transition-colors`}
            >
              <ThumbsDown className="h-5 w-5" />
              <span>{thread.downvotes.length}</span>
            </button>
            <button
              onClick={handleReport}
              className="text-gray-400 hover:text-yellow-500 transition-colors flex items-center space-x-1"
            >
              <Bell className="h-5 w-5" />
              <span>Report</span>
            </button>
          </div>
        </div>
        
        {/* Comments section */}
        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Comments ({thread.comments?.length || 0})
          </h2>
          
          {/* Comment form */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-surface-light flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex-grow">
                <textarea
                  className="w-full bg-surface-light p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-gray-700 min-h-[100px]"
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button
                    className="btn-primary py-2 px-6 flex items-center space-x-2"
                    onClick={handleAddComment}
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments list */}
          {thread.comments && thread.comments.length > 0 ? (
            <div className="space-y-6">
              {thread.comments.map((comment, index) => (
                <div key={comment.id || index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="h-10 w-10 rounded-full bg-surface-light flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => navigate(`/profile/${comment.authorName}`)}
                    >
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="bg-surface-light p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <div 
                          className="font-medium hover:text-primary cursor-pointer transition-colors"
                          onClick={() => navigate(`/profile/${comment.authorName}`)}
                        >
                          {comment.authorName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {comment.createdAt instanceof Date 
                            ? comment.createdAt.toLocaleString() 
                            : new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-gray-200">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface-light rounded-xl">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">No comments yet</h3>
              <p className="text-gray-400">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumThreadDetailPage; 