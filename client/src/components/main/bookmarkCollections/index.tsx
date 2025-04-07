import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from '@fake-stack-overflow/shared/types/bookmark';
import {
  fetchCollections,
  createCollection,
  removeBookmarkFromCollection,
  fetchBookmarksForCollection,
  fetchAllBookmarks,
} from '../../../services/bookmarkService';
import { deleteCollection } from '../../../services/collectionService';
import './index.css';
import { getQuestionById } from '../../../services/questionService';
import useUserContext from '../../../hooks/useUserContext';

const BookmarkCollections: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collections, setCollections] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<(Bookmark | string)[]>([]);
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookmarkDetails, setBookmarkDetails] = useState<{ [key: string]: { title: string } }>({});
  const [error, setError] = useState<string | null>(null);

  const user = useUserContext();
  const username = user?.user?.username;
  const navigate = useNavigate();

  const fetchQuestionDetails = async (bookmarkList: (Bookmark | string)[]) => {
    const details: { [key: string]: { title: string } } = {};

    for (const bookmark of bookmarkList) {
      try {
        let questionId;

        // Handle if bookmark is a string (from collection-specific fetches)
        if (typeof bookmark === 'string') {
          questionId = bookmark;
        }
        // Handle if bookmark is an object (from fetchAllBookmarks)
        else if (bookmark && bookmark.questionId) {
          questionId = bookmark.questionId;
        }

        const questionIdString = String(questionId);

        // eslint-disable-next-line no-await-in-loop
        const questionData = await getQuestionById(questionIdString, username);
        details[questionIdString] = {
          title: questionData.title || 'Untitled Question',
        };
      } catch (err) {
        setError(`Failed to fetch details for question`);
      }
    }

    setBookmarkDetails(details);
  };

  const loadCollections = useCallback(async () => {
    if (!username) {
      setError('Not logged in. Please log in to view your bookmarks.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchCollections(username);
      setCollections(data);

      // If collections exist, select the first one by default
      if (data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0]._id.toString());
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [username, selectedCollection]);

  const loadBookmarks = useCallback(async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      const data = await fetchAllBookmarks(username);

      // Make sure each bookmark has a valid questionId
      const validBookmarks = data.filter(bookmark => {
        if (!bookmark.questionId) {
          return false;
        }
        return true;
      });

      setBookmarks(validBookmarks);

      if (validBookmarks.length > 0) {
        fetchQuestionDetails(validBookmarks);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const loadBookmarksForCollection = useCallback(
    async (collectionId: string) => {
      if (!collectionId || !username) return;

      try {
        setIsLoading(true);
        const data = await fetchBookmarksForCollection(collectionId, username);

        // Handle data regardless of its type (Array<string> or Array<Bookmark>)
        if (data.length > 0) {
          // Check data type - if it's an array of strings
          if (typeof data[0] === 'string') {
            // No need to transform, just set directly as the new state format supports strings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setBookmarks(data as any[]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fetchQuestionDetails(data as any[]);
          } else {
            // It's an array of bookmark objects
            const validBookmarks = data.filter((bookmark: Bookmark) => !!bookmark.questionId);
            setBookmarks(validBookmarks);
            fetchQuestionDetails(validBookmarks);
          }
        } else {
          // Empty array
          setBookmarks([]);
        }
      } catch (err) {
        setError((err as Error).message);
        setBookmarks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [username],
  );

  // First effect to load collections when component mounts
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Second effect to load all bookmarks when component mounts
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Third effect to load collection-specific bookmarks when a collection is selected
  useEffect(() => {
    if (selectedCollection) {
      loadBookmarksForCollection(selectedCollection);
    }
  }, [selectedCollection, loadBookmarksForCollection]);

  // Listen for bookmarkAdded events
  useEffect(() => {
    const handleBookmarkAdded = (event: Event) => {
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
      setError((err as Error).message);
    }
  };

  const handleBookmarkClick = (questionId: string | undefined) => {
    if (!questionId) {
      return;
    }

    if (questionId === 'undefined') {
      return;
    }

    try {
      navigate(`/question/${questionId}`);
    } catch (err) {
      window.location.href = `/question/${questionId}`;
    }
  };

  const handleRemoveBookmark = async (questionId: string) => {
    if (!selectedCollection || !username) return;

    try {
      // 1. Immediately update local state for better UX
      const updatedBookmarks = bookmarks.filter(bookmark => {
        if (typeof bookmark === 'string') {
          return bookmark !== questionId;
        }
        return bookmark.questionId !== questionId;
      });
      setBookmarks(updatedBookmarks);

      // 2. Remove from server
      await removeBookmarkFromCollection(selectedCollection, questionId, username);

      // 3. Force reload of collections and bookmarks
      await loadCollections();

      if (selectedCollection) {
        await loadBookmarksForCollection(selectedCollection);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');

      // 4. On error, reload the data to keep UI in sync
      loadBookmarksForCollection(selectedCollection);
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchTerm) return true;

    let questionId;

    // Handle if bookmark is a string
    if (typeof bookmark === 'string') {
      questionId = bookmark;
    }
    // Handle if bookmark is an object
    else if (bookmark && bookmark.questionId) {
      questionId = bookmark.questionId;
    } else {
      return false;
    }

    // Validate the question ID
    const questionIdString = String(questionId);
    if (!questionIdString || questionIdString === 'undefined' || questionIdString === 'null') {
      return false;
    }

    // Convert for case-insensitive search
    const lowerQuestionId = questionIdString.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    // Get title if available
    const title = bookmarkDetails[questionIdString]?.title?.toLowerCase() || '';

    // Match either the ID or title
    return lowerQuestionId.includes(searchTermLower) || title.includes(searchTermLower);
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
                  filteredBookmarks.map((bookmark, index) => {
                    // Determine questionId based on bookmark type
                    let questionId;
                    if (typeof bookmark === 'string') {
                      questionId = bookmark;
                    } else if (bookmark && bookmark.questionId) {
                      questionId = bookmark.questionId;
                    } else {
                      return null;
                    }

                    // Convert to string and validate
                    const questionIdString = String(questionId);
                    if (!questionIdString) {
                      return null;
                    }

                    const uniqueKey = `bookmark-${index}-${questionIdString}`;
                    return (
                      <div key={uniqueKey} className='bookmark-card'>
                        <div
                          className='bookmark-content'
                          onClick={() => {
                            handleBookmarkClick(questionIdString);
                          }}>
                          <h3>
                            {bookmarkDetails[questionIdString]?.title ||
                              `Question ID: ${questionIdString}`}
                          </h3>
                          <div className='bookmark-meta'>
                            {typeof bookmark !== 'string' && bookmark.createdAt && (
                              <span className='bookmark-date'>
                                Added: {new Date(bookmark.createdAt).toLocaleDateString()}
                              </span>
                            )}
                            <span className='bookmark-user'>
                              By: {typeof bookmark !== 'string' ? bookmark.username : username}
                            </span>
                          </div>
                        </div>
                        <button
                          className='remove-btn'
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveBookmark(questionIdString);
                          }}>
                          Remove
                        </button>
                      </div>
                    );
                  })
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
