import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

interface NewsArticleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const NewsArticleForm: React.FC<NewsArticleFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'News',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Must be logged in to post news');

      const newsData = {
        ...formData,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || 'https://i.pravatar.cc/150?img=1',
        publishDate: serverTimestamp(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      await addDoc(collection(db, 'news'), newsData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post news article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 rounded-xl">
      <h2 className="text-2xl font-bold font-orbitron mb-6">Create News Article</h2>
      
      {error && (
        <div className="bg-red-500/20 text-red-500 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-background p-3 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Excerpt</label>
        <input
          type="text"
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          className="w-full bg-background p-3 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Cover Image URL</label>
        <input
          type="url"
          value={formData.coverImage}
          onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
          className="w-full bg-background p-3 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full bg-background p-3 rounded-lg"
        >
          <option value="News">News</option>
          <option value="Industry">Industry</option>
          <option value="Review">Review</option>
          <option value="Interview">Interview</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full bg-background p-3 rounded-lg min-h-[200px]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          className="w-full bg-background p-3 rounded-lg"
          placeholder="news, announcement, etc."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost px-6 py-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Article'}
        </button>
      </div>
    </form>
  );
};

export default NewsArticleForm;