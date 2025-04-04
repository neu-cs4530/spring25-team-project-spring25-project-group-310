import React, { useState, useEffect } from 'react';
import { DatabaseCollection } from '@fake-stack-overflow/shared/types/collection';
import { Bookmark } from '@fake-stack-overflow/shared/types/bookmark';
import {
  fetchCollections,
  createCollection,
  fetchBookmarksForCollection,
  removeBookmarkFromCollection,
} from '../../../services/bookmarkService';
import { deleteCollection } from '../../../services/collectionService';
import './index.css';
import useBookmarksPage from '../../../hooks/useBookmarksPage';

interface BookmarkCollectionsProps {
  username: string;
}

const BookmarkCollections: React.FC<BookmarkCollectionsProps> = ({ username }) => {
  const [collections, setCollections] = useState<DatabaseCollection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Fetch collections for the user
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCollections(username);
        setCollections(data);

        // If collections exist, select the first one by default
        if (data.length > 0) {
          setSelectedCollection(data[0]._id.toString());
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadBookmarks = async () => {
      if (!selectedCollection) throw new Error('No collection selected');
      try {
        const data = await fetchBookmarksForCollection(selectedCollection);
        setBookmarks(data);
        console.log('Fetched bookmarks:', data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadBookmarks();
    loadCollections();
  }, [username, selectedCollection]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = await createCollection(newCollectionName, username);
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setIsCreatingCollection(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSelectCollection = (collectionId: string) => {
    setSelectedCollection(collectionId);
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId, username);

      setCollections(collections.filter(c => c._id.toString() !== collectionId));

      if (selectedCollection === collectionId) {
        setSelectedCollection(collections.length > 1 ? collections[0]._id.toString() : null);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBookmarkClick = (questionId: string) => {
    // Add debug message
    setDebugInfo(`Clicked on bookmark with question ID: ${questionId}`);

    // Navigate to the bookmarked question
    try {
      // this will open in a new tab and not interfere with the current page state for testing
      window.open(`/question/${questionId}`, '_blank');
    } catch (err) {
      setError(`Error navigating: ${(err as Error).message}`);
    }
  };

  const handleRemoveBookmark = async (questionId: string) => {
    if (!selectedCollection) return;

    try {
      // Log for debugging
      setDebugInfo(
        `Attempting to remove bookmark: ${questionId} from collection: ${selectedCollection}`,
      );

      await removeBookmarkFromCollection(selectedCollection, questionId);

      // Remove the bookmark from the current list
      setBookmarks(bookmarks.filter(b => b.questionId !== questionId));
      setDebugInfo(`Successfully removed bookmark: ${questionId}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchTerm) return true;
    return bookmark.questionId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedCollectionData = collections.find(c => c._id.toString() === selectedCollection);

  if (isLoading) {
    return <div className='loading'>Loading collections...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  return (
    <div className='bookmark-collections-container'>
      {/* Debug Info Display */}
      {debugInfo && (
        <div className='debug-info'>
          <strong>Debug:</strong> {debugInfo}
          <button onClick={() => setDebugInfo(null)} className='clear-debug-btn'>
            Clear
          </button>
        </div>
      )}

      {/* Collections Sidebar */}
      <div className='collections-sidebar'>
        <div className='collections-header'>
          <h2>Collections</h2>
          <button onClick={() => setIsCreatingCollection(true)} className='new-collection-btn'>
            + New
          </button>
        </div>

        {isCreatingCollection && (
          <div className='new-collection-form'>
            <input
              type='text'
              placeholder='Collection name'
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              className='collection-name-input'
            />
            <div className='form-actions'>
              <button onClick={() => setIsCreatingCollection(false)} className='cancel-btn'>
                Cancel
              </button>
              <button onClick={handleCreateCollection} className='create-btn'>
                Create
              </button>
            </div>
          </div>
        )}

        <div className='collections-list'>
          {collections.map(collection => (
            <div
              key={collection._id.toString()}
              className={`collection-item ${selectedCollection === collection._id.toString() ? 'selected' : ''}`}
              onClick={() => handleSelectCollection(collection._id.toString())}>
              <div className='collection-info'>
                <h3>{collection.name}</h3>
                <span className='bookmark-count'>{collection.bookmarks.length}</span>
              </div>
              {selectedCollection === collection._id.toString() && !collection.isDefault && (
                <div className='collection-actions'>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteCollection(collection._id.toString());
                    }}
                    className='delete-btn'>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bookmarks Area */}
      <div className='bookmarks-area'>
        {bookmarks ? (
          <>
            <div className='search-container'>
              <input
                type='text'
                placeholder='Search bookmarks...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='search-input'
              />
            </div>

            <h2 className='bookmarks-title'>{selectedCollectionData?.name} Bookmarks</h2>

            {filteredBookmarks.length > 0 ? (
              <div className='bookmarks-list'>
                {filteredBookmarks.map(bookmark => (
                  <div
                    key={bookmark.questionId}
                    className='bookmark-item'
                    onClick={() => handleBookmarkClick(bookmark.questionId)}>
                    <div className='bookmark-content'>
                      <h3 className='bookmark-title'>Question: {bookmark.questionId}</h3>
                      <div className='bookmark-meta'>
                        <span className='bookmark-date'>
                          {bookmark.createdAt
                            ? new Date(bookmark.createdAt).toLocaleDateString()
                            : 'No date'}
                        </span>
                        <span className='bookmark-user'>Bookmarked by: {bookmark.username}</span>
                      </div>
                    </div>
                    <button
                      className='remove-bookmark-btn'
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveBookmark(bookmark.questionId);
                      }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='empty-state'>
                {searchTerm
                  ? 'No bookmarks match your search'
                  : 'No bookmarks in this collection yet'}
              </div>
            )}
          </>
        ) : (
          <div className='empty-state'>
            <p>Select a collection to view bookmarks</p>
            <p>or</p>
            <button onClick={() => setIsCreatingCollection(true)} className='create-collection-btn'>
              Create a new collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkCollections;
