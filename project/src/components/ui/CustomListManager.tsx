import React, { useState, useEffect } from 'react';
import { X, Edit, Film, Settings } from 'lucide-react';
import { PlusCircle, Trash2, List, Lock, Globe } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { 
  getUserCustomLists, 
  createCustomList, 
  updateCustomList, 
  deleteCustomList, 
  addAnimeToCustomList, 
  removeAnimeFromCustomList 
} from '../../services/customLists';
import { CustomList, Anime } from '../../types';
import toast from 'react-hot-toast';

interface CustomListManagerProps {
  animeId?: string;
  anime?: Anime;
  mode: 'view' | 'add'; // view: show lists, add: add anime to list
  onClose?: () => void;
  className?: string;
}

const PRESET_COLORS = [
  '#FF5757', '#FF914D', '#FFDE59', '#A5DD55',
  '#5CE1E6', '#7371FC', '#C04CFD', '#FF66C4'
];

const CustomListManager: React.FC<CustomListManagerProps> = ({ 
  animeId, 
  anime, 
  mode, 
  onClose,
  className = '' 
}) => {
  const { currentUser } = useAuth();
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListColor, setNewListColor] = useState(PRESET_COLORS[0]);
  const [newListPublic, setNewListPublic] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      fetchLists();
    }
  }, [currentUser]);
  
  const fetchLists = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const lists = await getUserCustomLists(currentUser.id);
      setCustomLists(lists);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch custom lists:', err);
      setError('Failed to load your custom lists');
      toast.error('Failed to load your custom lists');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateList = async () => {
    if (!currentUser?.id) return;
    
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    
    try {
      const newList = await createCustomList(currentUser.id, {
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        animeIds: animeId ? [animeId] : [],
        iconColor: newListColor,
        isPublic: newListPublic,
      });
      
      setCustomLists([...customLists, newList]);
      setIsCreating(false);
      setNewListName('');
      setNewListDescription('');
      setNewListColor(PRESET_COLORS[0]);
      setNewListPublic(true);
      
      toast.success(`List "${newListName}" created successfully`);
      
      if (animeId && anime?.title) {
        toast.success(`Added "${anime.title}" to "${newListName}"`);
      }
    } catch (err) {
      console.error('Failed to create custom list:', err);
      toast.error('Failed to create list');
    }
  };
  
  const handleUpdateList = async (listId: string) => {
    if (!currentUser?.id) return;
    
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    
    try {
      const updatedList = await updateCustomList(currentUser.id, listId, {
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        iconColor: newListColor,
        isPublic: newListPublic,
      });
      
      setCustomLists(customLists.map(list => 
        list.id === listId ? updatedList : list
      ));
      
      setIsEditing(null);
      setNewListName('');
      setNewListDescription('');
      setNewListColor(PRESET_COLORS[0]);
      
      toast.success(`List updated successfully`);
    } catch (err) {
      console.error('Failed to update custom list:', err);
      toast.error('Failed to update list');
    }
  };
  
  const handleDeleteList = async (listId: string, listName: string) => {
    if (!currentUser?.id) return;
    
    if (!window.confirm(`Are you sure you want to delete the list "${listName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteCustomList(currentUser.id, listId);
      
      setCustomLists(customLists.filter(list => list.id !== listId));
      toast.success(`List "${listName}" deleted`);
    } catch (err) {
      console.error('Failed to delete custom list:', err);
      toast.error('Failed to delete list');
    }
  };
  
  const handleAddAnimeToList = async (listId: string, listName: string) => {
    if (!currentUser?.id || !animeId) return;
    
    try {
      const updatedList = await addAnimeToCustomList(currentUser.id, listId, animeId);
      
      setCustomLists(customLists.map(list => 
        list.id === listId ? updatedList : list
      ));
      
      toast.success(`Added "${anime?.title || 'Anime'}" to "${listName}"`);
      
      if (onClose) {
        setTimeout(onClose, 1000);
      }
    } catch (err) {
      console.error('Failed to add anime to list:', err);
      toast.error('Failed to add anime to list');
    }
  };
  
  const handleRemoveAnimeFromList = async (listId: string, listName: string) => {
    if (!currentUser?.id || !animeId) return;
    
    try {
      const updatedList = await removeAnimeFromCustomList(currentUser.id, listId, animeId);
      
      setCustomLists(customLists.map(list => 
        list.id === listId ? updatedList : list
      ));
      
      toast.success(`Removed from "${listName}"`);
    } catch (err) {
      console.error('Failed to remove anime from list:', err);
      toast.error('Failed to remove anime from list');
    }
  };
  
  const startEditing = (list: CustomList) => {
    setIsEditing(list.id);
    setNewListName(list.name);
    setNewListDescription(list.description || '');
    setNewListColor(list.iconColor || PRESET_COLORS[0]);
    setNewListPublic(list.isPublic);
  };
  
  const isInList = (list: CustomList) => {
    return animeId && list.animeIds.includes(animeId);
  };
  
  // Render the manager
  return (
    <div className={`bg-surface p-4 rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {mode === 'view' ? 'My Custom Lists' : 'Add to List'}
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-light rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="mb-6 bg-surface-dark p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-3">
            {isCreating ? 'Create New List' : 'Edit List'}
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">List Name</label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="E.g., Summer Favorites"
                className="w-full bg-surface-light p-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Description (Optional)</label>
              <textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="What's this list about?"
                rows={2}
                className="w-full bg-surface-light p-2 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewListColor(color)}
                    className={`h-8 w-8 rounded-full ${newListColor === color ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newListPublic}
                  onChange={(e) => setNewListPublic(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded accent-primary"
                />
                Make this list public
              </label>
              <span className="ml-2 text-gray-400 text-xs flex items-center">
                {newListPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                {newListPublic ? 'Anyone can see this list' : 'Only you can see this list'}
              </span>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(null);
                  setNewListName('');
                  setNewListDescription('');
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => isEditing ? handleUpdateList(isEditing) : handleCreateList()}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                {isCreating ? 'Create List' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* List of lists */}
      {isLoading ? (
        <div className="py-6 text-center text-gray-400">
          <div className="animate-pulse">Loading your lists...</div>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-red-400">
          <p>{error}</p>
          <button 
            onClick={fetchLists} 
            className="mt-2 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {customLists.length === 0 && !isCreating ? (
            <div className="py-6 text-center text-gray-400">
              <List className="h-12 w-12 mx-auto mb-2 text-gray-500" />
              <p className="mb-4">You haven't created any custom lists yet</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Create Your First List
              </button>
            </div>
          ) : (
            customLists.map(list => (
              <div
                key={list.id}
                className={`p-3 rounded-lg ${
                  isEditing === list.id 
                    ? 'bg-surface-light' 
                    : 'bg-surface-dark hover:bg-surface-light'
                } transition-colors`}
              >
                {isEditing !== list.id && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0 mr-3"
                        style={{ backgroundColor: list.iconColor || '#9900FF' }}
                      >
                        <Film className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{list.name}</h4>
                        <div className="flex items-center text-xs text-gray-400">
                          <Film className="h-3 w-3 mr-1" />
                          <span>{list.animeIds.length} anime</span>
                          {!list.isPublic && <Lock className="h-3 w-3 ml-2" />}
                        </div>
                      </div>
                    </div>
                    
                    {mode === 'view' ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startEditing(list)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-surface-light rounded-md transition-colors"
                          aria-label="Edit list"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id, list.name)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-surface-light rounded-md transition-colors"
                          aria-label="Delete list"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => isInList(list) 
                          ? handleRemoveAnimeFromList(list.id, list.name) 
                          : handleAddAnimeToList(list.id, list.name)
                        }
                        className={`px-4 py-1 rounded-full text-sm ${
                          isInList(list)
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'border border-gray-600 text-gray-300 hover:bg-surface-light'
                        } transition-colors`}
                      >
                        {isInList(list) ? 'Remove' : 'Add'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Create new list button */}
      {!isCreating && !isEditing && (
        <button
          onClick={() => setIsCreating(true)}
          className="mt-4 w-full py-3 flex items-center justify-center rounded-lg border border-dashed border-gray-600 text-gray-300 hover:border-primary hover:text-primary transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New List
        </button>
      )}
    </div>
  );
};

export default CustomListManager; 