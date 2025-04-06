import React, { useState, useEffect, useCallback } from 'react';
import { DatabaseCollection } from '@fake-stack-overflow/shared/types/collection';
import { Bookmark } from '@fake-stack-overflow/shared/types/bookmark';
import {
  fetchCollections,
  createCollection,
  removeBookmarkFromCollection,
  fetchBookmarksForCollection,
  fetchAllBookmarks,
} from '../../../services/bookmarkService';
import { deleteCollection, getBookmarksForCollection } from '../../../services/collectionService';
import './index.css';
import { getQuestionById } from '../../../services/questionService';
import useUserContext from '../../../hooks/useUserContext';

const BookmarkCollections: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collections, setCollections] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookmarkDetails, setBookmarkDetails] = useState<{ [key: string]: { title: string } }>({});
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const user = useUserContext();
  const username = user?.user?.username;

  // Load collections using the same approach as ProfileSettings
  const loadCollections = useCallback(async () => {
    if (!username) {
      setError('Not logged in. Please log in to view your bookmarks.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading collections for user:', username);
      const data = await fetchCollections(username);
      console.log('Fetched collections:', data);
      setCollections(data);

      // If collections exist, select the first one by default
      if (data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0]._id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch collections', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [username, selectedCollection]);

  const loadBookmarks = useCallback(async () => {
    if (!selectedCollection || !username) return;

    try {
      setIsLoading(true);
      console.log('Loading bookmarks for collection:', selectedCollection, 'user:', username);
      const data = await fetchAllBookmarks(username);
      console.log('Fetched bookmarks:', data);
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection, username]);

  const fetchQuestionDetails = async (bookmarkList: Bookmark[]) => {
    const details: { [key: string]: { title: string } } = {};

    for (const bookmark of bookmarks) {
      try {
        console.log('bookmark id:', bookmark.questionId);
        // eslint-disable-next-line no-await-in-loop
        const questionData = await getQuestionById(bookmark.questionId, username);
        details[bookmark.questionId] = {
          title: questionData.title,
        };
      } catch (err) {
        console.error(`Failed to fetch details for question ${bookmark.questionId}`, err);
      }
    }

    setBookmarkDetails(details);
  };

  const loadBookmarksForCollection = useCallback(
    async (collectionId: string) => {
      if (!collectionId || !username) return;

      try {
        setIsLoading(true);
        console.log('Loading bookmarks for collection:', collectionId, 'user:', username);
        const data = await fetchBookmarksForCollection(collectionId, username);
        console.log('Fetched bookmarks:', data);
        setBookmarks(data);
        fetchQuestionDetails(data);
      } catch (err) {
        console.error('Failed to fetch bookmarks', err);
        setError((err as Error).message);
        setBookmarks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [username],
  );

  // Initialize data loading
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Load bookmarks when collection changes
  useEffect(() => {
    if (selectedCollection) {
      loadBookmarksForCollection(selectedCollection);
      if (bookmarks.length > 0) {
        console.log('Bookmarks loaded:', bookmarks);
        console.log('First bookmark questionId:', bookmarks[0].questionId);
        console.log('First bookmark questionId type:', typeof bookmarks[0].questionId);
      }
    }
  }, [selectedCollection, loadBookmarksForCollection, loadBookmarks]);

  // Listen for bookmarkAdded events
  useEffect(() => {
    const handleBookmarkAdded = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Bookmark added event received:', customEvent.detail);

      // Reload collections to get the latest data
      loadBookmarks();
      loadCollections();

      // If there's an active collection, reload its bookmarks
      if (selectedCollection) {
        loadBookmarksForCollection(selectedCollection);
      }
    };

    window.addEventListener('bookmarkAdded', handleBookmarkAdded);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('bookmarkAdded', handleBookmarkAdded);
    };
  }, [selectedCollection, loadCollections, loadBookmarksForCollection, loadBookmarks]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !username) return;

    try {
      console.log('Creating collection for user:', username);
      const newCollection = await createCollection(newCollectionName, username);
      console.log('Created collection:', newCollection);
      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setIsCreatingCollection(false);
    } catch (err) {
      console.error('Failed to create collection', err);
      setError((err as Error).message);
    }
  };

  const handleSelectCollection = (collectionId: string) => {
    setSelectedCollection(collectionId);
    loadBookmarksForCollection(collectionId);
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!username) return;

    try {
      await deleteCollection(collectionId, username);
      setCollections(collections.filter(c => c._id.toString() !== collectionId));

      if (selectedCollection === collectionId) {
        // If there are other collections, select the first one
        if (collections.length > 1) {
          const remainingCollections = collections.filter(c => c._id.toString() !== collectionId);
          setSelectedCollection(remainingCollections[0]._id.toString());
        } else {
          setSelectedCollection(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete collection', err);
      setError((err as Error).message);
    }
  };

  const handleBookmarkClick = (questionId: string) => {
    console.log('Clicked on bookmark with question ID:', questionId);
    if (!questionId) {
      console.error('Attempted to click on bookmark with invalid questionId');
      return;
    }

    try {
      window.open(`/question/${questionId}`, '_blank');
    } catch (err) {
      console.error('Error navigating:', err);
      setError(`Error navigating: ${(err as Error).message}`);
    }
  };

  const handleRemoveBookmark = async (questionId: string) => {
    if (!selectedCollection) return;

    try {
      console.log('Removing bookmark:', questionId, 'from collection:', selectedCollection);
      await removeBookmarkFromCollection(selectedCollection, questionId);

      // Remove the bookmark from the current list
      setBookmarks(bookmarks.filter(b => b.questionId !== questionId));

      // Refresh collections to update count
      loadCollections();
    } catch (err) {
      console.error('Failed to remove bookmark', err);
      setError((err as Error).message);
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchTerm) return true;
    return bookmark.questionId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedCollectionData = collections.find(c => c._id.toString() === selectedCollection);

  if (!username) {
    return (
      <div className='bookmarks-login-required'>
        <div className='login-card'>
          <h2>Login Required</h2>
          <p>Please log in to view your bookmarks</p>
          Go to Login
        </div>
      </div>
    );
  }

  if (isLoading && collections.length === 0) {
    return (
      <div className='bookmarks-loading'>
        <div className='loading-spinner'></div>
        <p>Loading your collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bookmarks-error'>
        <div className='error-card'>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button
            className='retry-btn'
            onClick={() => {
              setError(null);
              loadCollections();
            }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bookmarks-page'>
      <div className='bookmarks-container'>
        {/* Sidebar */}
        <div className='sidebar'>
          <div className='sidebar-header'>
            <h2>Collections</h2>
            <button className='create-btn' onClick={() => setIsCreatingCollection(true)}>
              + New Collection
            </button>
          </div>

          {/* New Collection Form */}
          {isCreatingCollection && (
            <div className='new-collection-form'>
              <input
                type='text'
                placeholder='Collection name'
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                autoFocus
              />
              <div className='form-actions'>
                <button className='cancel-btn' onClick={() => setIsCreatingCollection(false)}>
                  Cancel
                </button>
                <button
                  className='submit-btn'
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}>
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Collections List */}
          <div className='collections-list'>
            {collections.length > 0 ? (
              collections.map(collection => (
                <div
                  key={collection._id.toString()}
                  className={`collection-item ${selectedCollection === collection._id.toString() ? 'active' : ''}`}
                  onClick={() => handleSelectCollection(collection._id.toString())}>
                  <div className='collection-info'>
                    <span className='collection-name'>{collection.name}</span>
                    <span className='collection-count'>{collection.bookmarks.length}</span>
                  </div>

                  {selectedCollection === collection._id.toString() && !collection.isDefault && (
                    <button
                      className='delete-btn'
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCollection(collection._id.toString());
                      }}>
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className='empty-collections'>
                <p>No collections yet</p>
                <button className='create-btn' onClick={() => setIsCreatingCollection(true)}>
                  Create Your First Collection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className='main-content'>
          {selectedCollection ? (
            <>
              <div className='content-header'>
                <h1>{selectedCollectionData?.name || 'Bookmarks'}</h1>
                <div className='search-bar'>
                  <input
                    type='text'
                    placeholder='Search bookmarks...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className='clear-search' onClick={() => setSearchTerm('')}>
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Bookmarks List */}
              <div className='bookmarks-list'>
                {filteredBookmarks.length > 0 ? (
                  filteredBookmarks.map(bookmark => (
                    // Make sure we have a valid ID
                    // const questionId = bookmark.questionId ? String(bookmark.questionId) : '';
                    // console.log(bookmark.questionId, 'questionId:', questionId);

                    // // Skip rendering if ID is invalid
                    // if (!questionId) {
                    //   console.error('Found bookmark with invalid questionId:', bookmark);
                    //   return null;
                    // }

                    <div key={bookmark.questionId} className='bookmark-card'>
                      <div
                        className='bookmark-content'
                        onClick={() => handleBookmarkClick(bookmark.questionId)}>
                        <h3>Question: {bookmark.questionId}</h3>
                        <div className='bookmark-meta'>
                          {bookmark.createdAt && (
                            <span className='bookmark-date'>
                              Added: {new Date(bookmark.createdAt).toLocaleDateString()}
                            </span>
                          )}
                          <span className='bookmark-user'>By: {bookmark.username}</span>
                        </div>
                      </div>
                      <button
                        className='remove-btn'
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveBookmark(bookmark.questionId);
                        }}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className='empty-bookmarks'>
                    {searchTerm ? (
                      <>
                        <p>No bookmarks match your search</p>
                        <button className='clear-btn' onClick={() => setSearchTerm('')}>
                          Clear Search
                        </button>
                      </>
                    ) : (
                      <p>No bookmarks in this collection yet</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='no-selection'>
              <h2>Select a Collection</h2>
              <p>Choose a collection from the sidebar to view your bookmarks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkCollections;
