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
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(
    null,
  );

  const user = useUserContext();
  const username = user?.user?.username;
  const navigate = useNavigate();

  const fetchQuestionDetails = useCallback(
    async (bookmarkList: (Bookmark | string)[]) => {
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
          } else {
            setError('Bookmark is missing questionId');
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
    },
    [username],
  );

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
      const validBookmarks = data.filter(bookmark => !!bookmark.questionId);

      setBookmarks(validBookmarks);

      if (validBookmarks.length > 0) {
        fetchQuestionDetails(validBookmarks);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [username, fetchQuestionDetails]);

  const loadBookmarksForCollection = useCallback(
    async (collectionId: string) => {
      if (!collectionId || !username) return;

      try {
        setIsLoading(true);
        const data = await fetchBookmarksForCollection(collectionId, username);

        // Handle data regardless of its type (Array<string> or Array<Bookmark>)
        if (data.length > 0) {
          if (typeof data[0] === 'string') {
            // If array of strings, set directly
            setBookmarks(data as unknown as string[]);
            fetchQuestionDetails(data as unknown as string[]);
          } else {
            const validBookmarks = (data as Bookmark[]).filter(bookmark => !!bookmark.questionId);
            setBookmarks(validBookmarks);
            fetchQuestionDetails(validBookmarks);
          }
        } else {
          setBookmarks([]);
        }
      } catch (err) {
        setError((err as Error).message);
        setBookmarks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [username, fetchQuestionDetails],
  );

  // Load collections when component mounts
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Load all bookmarks when component mounts
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Load collection-specific bookmarks when a collection is selected
  useEffect(() => {
    if (selectedCollection) {
      loadBookmarksForCollection(selectedCollection);
    }
  }, [selectedCollection, loadBookmarksForCollection]);

  // Listen for bookmarkAdded events
  useEffect(() => {
    const handleBookmarkAdded = (event: Event) => {
      loadBookmarks();
      loadCollections();

      if (selectedCollection) {
        loadBookmarksForCollection(selectedCollection);
      }
    };

    window.addEventListener('bookmarkAdded', handleBookmarkAdded);
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
        // If there are other collections, select the first one; otherwise, clear selection.
        if (collections.length > 1) {
          const remainingCollections = collections.filter(c => c._id.toString() !== collectionId);
          setSelectedCollection(remainingCollections[0]._id.toString());
        } else {
          setSelectedCollection(null);
        }
      }

      // Reset delete confirmation
      setCollectionToDelete(null);
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

  // eslint-disable-next-line
  const handleRemoveBookmark = async (questionId: string) => {
    if (!selectedCollection || !username) return;

    try {
      // Optimistically update UI
      const updatedBookmarks = bookmarks.filter(bookmark => {
        if (typeof bookmark === 'string') {
          return bookmark !== questionId;
        }
        return bookmark.questionId !== questionId;
      });
      setBookmarks(updatedBookmarks);

      // Remove bookmark from the server
      await removeBookmarkFromCollection(selectedCollection, questionId, username);

      // Reload collections and bookmarks
      await loadCollections();
      if (selectedCollection) {
        await loadBookmarksForCollection(selectedCollection);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
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

    const questionIdString = String(questionId);
    if (!questionIdString || questionIdString === 'undefined' || questionIdString === 'null') {
      return false;
    }

    const lowerQuestionId = questionIdString.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    const title = bookmarkDetails[questionIdString]?.title?.toLowerCase() || '';
    return lowerQuestionId.includes(searchTermLower) || title.includes(searchTermLower);
  });

  const selectedCollectionData = collections.find(c => c._id.toString() === selectedCollection);

  const renderDeleteConfirmationModal = () => {
    if (!collectionToDelete) return null;

    return (
      <div className='modal-overlay'>
        <div className='modal-content'>
          <h2>Confirm Deletion</h2>
          <p>
            Are you sure you want to delete the &quot;{collectionToDelete.name}&quot; collection?
          </p>
          <div className='modal-actions'>
            <button className='cancel-btn' onClick={() => setCollectionToDelete(null)}>
              Cancel
            </button>
            <button
              className='delete-btn'
              onClick={() => handleDeleteCollection(collectionToDelete.id)}>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                        setCollectionToDelete({
                          id: collection._id.toString(),
                          name: collection.name,
                        });
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
                    let questionId;
                    if (typeof bookmark === 'string') {
                      questionId = bookmark;
                    } else if (bookmark && bookmark.questionId) {
                      questionId = bookmark.questionId;
                    } else {
                      return null;
                    }
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
      {renderDeleteConfirmationModal()}
    </div>
  );
};

export default BookmarkCollections;
