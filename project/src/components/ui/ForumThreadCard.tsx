import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, ClockIcon } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

// Updated the ForumThread type to include comments, upvotes, and downvotes as arrays
interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string | number | Date;
  category: string;
  tags: string[];
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
  }>;
  upvotes: string[];
  downvotes: string[];
}

interface ForumThreadCardProps {
  thread: ForumThread;
}

const ForumThreadCard: React.FC<ForumThreadCardProps> = ({ thread }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; content: string; authorId: string; authorName: string; createdAt: Date }>>(thread.comments || []);
  const [upvotes, setUpvotes] = useState(Array.isArray(thread.upvotes) ? thread.upvotes : []);
  const [downvotes, setDownvotes] = useState(Array.isArray(thread.downvotes) ? thread.downvotes : []);

  const handleAddComment = async () => {
    if (!auth.currentUser) {
      alert('Please log in to comment.');
      return;
    }

    if (!comment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      const commentData = {
        content: comment.trim(),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        threadId: thread.id,
      };

      const commentRef = collection(db, 'comments');
      const docRef = await addDoc(commentRef, commentData);

      // Update user's stats and XP in Firebase
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      await updateDoc(userDocRef, {
        'stats.comments': increment(1), // Increment comments count in stats
        xp: increment(5), // Give user 5 XP for commenting
        level: Math.floor((userData.xp + 5) / 1000) + 1 // Update level based on new XP
      });

      setComments([
        ...comments,
        { ...commentData, id: docRef.id, createdAt: new Date() },
      ]);
      setComment('');
      
      alert('Comment added successfully! You earned 5 XP.');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Added explicit types and null checks
  const handleLike = async () => {
    if (!auth.currentUser) {
      alert('Please log in to like this thread.');
      return;
    }

    const threadRef = doc(db, 'forumThreads', thread.id);
    const isLiked = upvotes.includes(auth.currentUser.uid);

    try {
      await updateDoc(threadRef, {
        upvotes: isLiked
          ? arrayRemove(auth.currentUser.uid)
          : arrayUnion(auth.currentUser.uid),
      });

      setUpvotes(
        isLiked
          ? upvotes.filter((id: string) => id !== auth.currentUser!.uid)
          : [...upvotes, auth.currentUser.uid]
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  // Added null check for auth.currentUser in downvotes.filter
  const handleDislike = async () => {
    if (!auth.currentUser) {
      alert('Please log in to dislike this thread.');
      return;
    }

    const threadRef = doc(db, 'forumThreads', thread.id);
    const isDisliked = downvotes.includes(auth.currentUser.uid);

    try {
      await updateDoc(threadRef, {
        downvotes: isDisliked
          ? arrayRemove(auth.currentUser.uid)
          : arrayUnion(auth.currentUser.uid),
      });

      setDownvotes(
        isDisliked
          ? downvotes.filter((id: string) => id !== auth.currentUser!.uid)
          : [...downvotes, auth.currentUser.uid]
      );
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  const handleReport = async () => {
    if (!auth.currentUser) {
      alert('Please log in to report this thread.');
      return;
    }

    try {
      const threadRef = doc(db, 'forumThreads', thread.id);
      await updateDoc(threadRef, { reported: true });
      alert('Thread reported successfully.');
    } catch (error) {
      console.error('Error reporting thread:', error);
      alert('Failed to report thread. Please try again.');
    }
  };

  return (
    <div className="card p-4 hover:border-l-4 hover:border-l-primary transition-all">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3">
          <img 
            src={thread.authorAvatar} 
            alt={thread.authorName} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <Link to={`/forum/${thread.id}`} className="font-bold text-white hover:text-primary transition-colors">
              {thread.title}
            </Link>
            <div className="flex items-center mt-1 text-xs text-gray-400">
              <span>by {thread.authorName}</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                {new Date(thread.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface px-2 py-1 rounded-full text-xs">
          {thread.category}
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mt-3 line-clamp-2">
        {thread.content}
      </p>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <div className="flex space-x-4 text-xs text-gray-400">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              auth.currentUser && upvotes.includes(auth.currentUser.uid) ? 'text-primary' : 'hover:text-primary'
            } transition-colors`}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{upvotes.length}</span>
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center space-x-1 ${
              auth.currentUser && downvotes.includes(auth.currentUser.uid) ? 'text-accent' : 'hover:text-accent'
            } transition-colors`}
          >
            <ThumbsDown className="h-3 w-3" />
            <span>{downvotes.length}</span>
          </button>
          <button
            onClick={handleReport}
            className="text-yellow-500 hover:text-yellow-700 transition-colors"
          >
            Report
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {thread.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-semibold">Comments</h4>
        <ul>
          {comments.map((c: { id: string; content: string; authorName: string }, index: number) => (
            <li key={index} className="text-sm text-gray-300">
              <strong>{c.authorName}:</strong> {c.content}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow bg-surface-light p-2 rounded-l"
          />
          <button
            onClick={handleAddComment}
            className="bg-primary text-white px-4 rounded-r"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumThreadCard;