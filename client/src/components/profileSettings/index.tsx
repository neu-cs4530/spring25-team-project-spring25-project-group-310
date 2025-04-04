import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { ObjectId } from 'mongodb';
import useProfileSettings from '../../hooks/useProfileSettings';
import {
  fetchCollections,
  fetchAllBookmarks,
  removeBookmark,
  createCollection,
  removeBookmarkFromCollection,
} from '../../services/bookmarkService';
import { deleteCollection, getBookmarksForCollection } from '../../services/collectionService';
// eslint-disable-next-line import/no-relative-packages
import { Bookmark } from '../../../../shared/types/bookmark';
import useUserContext from '../../hooks/useUserContext';

// Import the CollectionModal component
import CollectionModal from '../main/collectionModal';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    errorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,

    setEditBioMode,
    setNewBio,
    setNewPassword,
    setPendingAction,
    setConfirmNewPassword,
    setShowConfirmation,

    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
  } = useProfileSettings();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionBookmarks, setSelectedCollectionBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collectionBookmarks, setCollectionBookmarks] = useState<ObjectId[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingBookmarkAction, setPendingBookmarkAction] = useState<(() => void) | null>(null);
  const [pendingCollectionAction, setPendingCollectionAction] = useState<(() => void) | null>(null);
  const [showCollectionConfirmation, setShowCollectionConfirmation] = useState(false);
  const [showBookmarkConfirmation, setShowBookmarkConfirmation] = useState(false);
  // Add state for collection modal
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const user = useUserContext();
  const username = user;

  const loadCollectionBookmarks = async (collectionId: string) => {
    if (!collectionId) return;

    setBookmarksLoading(true);
    setActiveCollectionId(collectionId);

    try {
      console.log('Loading bookmarks for user:', username);
      // const bookmarks = await fetchBookmarksForCollection(collectionId);
      // console.log('Fetched bookmarks:', bookmarks);
      // setSelectedCollectionBookmarks(bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks', error);
      setSelectedCollectionBookmarks([]);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const loadBookmarks = useCallback(async () => {
    try {
      console.log('Loading bookmarks for user:', username.user.username);
      setBookmarksLoading(true);
      const bookmarks = await fetchAllBookmarks(username.user.username);
      console.log('Fetched bookmarks:', bookmarks);
      setAllBookmarks(bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks', error);
      setSelectedCollectionBookmarks([]);
    }
  }, [username]);

  const loadCollections = useCallback(async () => {
    if (userData?.username) {
      try {
        console.log('Loading collections for user:', username.user.username);
        const fetchedCollections = await fetchCollections(username.user.username);
        console.log('Fetched collections:', fetchedCollections);
        setCollections(fetchedCollections);

        // If there are collections and none is active, select the first one
        if (fetchedCollections.length > 0 && !activeCollectionId) {
          const firstCollectionId = fetchedCollections[0]._id;
          setActiveCollectionId(firstCollectionId);
          loadCollectionBookmarks(firstCollectionId);
        }
      } catch (error) {
        console.error('Failed to fetch collections', error);
      }
    }
  }, [userData, username, activeCollectionId]);

  // Initial load of collections
  useEffect(() => {
    loadBookmarks();
    loadCollections();
  }, [loadCollections, loadBookmarks]);

  // Listen for bookmarkAdded events
  useEffect(() => {
    const handleBookmarkAdded = (event: Event) => {
      // Type assertion for CustomEvent
      const customEvent = event as CustomEvent;
      console.log('Bookmark added event received:', customEvent.detail);

      // Reload all bookmarks to get the latest data
      loadBookmarks();

      // If there's an active collection, reload its bookmarks
      if (activeCollectionId) {
        console.log('Refreshing bookmarks for active collection:', activeCollectionId);
        loadCollectionBookmarks(activeCollectionId);
      }
    };

    // Add event listener
    window.addEventListener('bookmarkAdded', handleBookmarkAdded);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('bookmarkAdded', handleBookmarkAdded);
    };
  }, [activeCollectionId, loadCollections]);

  // Handle collection deletion
  const handleDeleteCollection = async (collectionId: string) => {
    setShowCollectionConfirmation(true);
    setPendingCollectionAction(() => async () => {
      try {
        await deleteCollection(collectionId, user.user.username);
        setCollections(collections.filter(collection => collection._id !== collectionId));
        // Reset active collection if deleted
        if (activeCollectionId === collectionId) {
          setActiveCollectionId(null);
          setSelectedCollectionBookmarks([]);
        }
        setShowCollectionConfirmation(false);
        setSuccessMessage('Collection deleted successfully.');
      } catch (error) {
        console.error('Failed to delete collection', error);
      }
    });
  };

  // Remove bookmark from collection
  const handleRemoveBookmark = async (bookmarkId: string, collectionId?: string) => {
    setShowBookmarkConfirmation(true);
    setPendingBookmarkAction(() => async () => {
      try {
        if (collectionId) {
          await removeBookmarkFromCollection(collectionId, bookmarkId);
        } else {
          // Remove bookmark from default collection
          console.log(
            'Removing bookmark from default collection:',
            bookmarkId,
            'username:',
            username,
          );
          await removeBookmark(username.user.username, bookmarkId);
        }
        setSuccessMessage('Bookmark deleted successfully.');
        // Refresh bookmarks for the current collection
        await loadBookmarks();
        await loadCollections();
        setShowBookmarkConfirmation(false);
      } catch (error) {
        console.error('Failed to remove bookmark', error);
      }
    });
  };

  const handleGetBookmarksForCollection = async (collectionId: string) => {
    try {
      console.log('Loading bookmarks for user:', user.user.username, 'collection:', collectionId);
      const bookmarks = await getBookmarksForCollection(collectionId, user.user.username);
      console.log('Fetched bookmarks:', bookmarks);
      setCollectionBookmarks(bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks', error);
      setSelectedCollectionBookmarks([]);
    }
  };

  const handleCreateCollection = async (collectionName: string) => {
    try {
      console.log('Creating collection for user:', user.user.username);
      const newCollection = await createCollection(collectionName, user.user.username);
      console.log('Created collection:', newCollection);
      setCollections([...collections, newCollection]);
      setSuccessMessage('Collection created successfully.');
    } catch (error) {
      console.error('Failed to create collection', error);
    }
  };

  if (loading) {
    return (
      <div className='page-container'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='page-container'>
      <div className='profile-card'>
        <h2>Profile</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {userData ? (
          <>
            <h4>General Information</h4>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>

            {/* ---- Biography Section ---- */}
            {!editBioMode && (
              <p>
                <strong>Biography:</strong> {userData.biography || 'No biography yet.'}
                {canEditProfile && (
                  <button
                    className='login-button'
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      setEditBioMode(true);
                      setNewBio(userData.biography || '');
                    }}>
                    Edit
                  </button>
                )}
              </p>
            )}

            {editBioMode && canEditProfile && (
              <div style={{ margin: '1rem 0' }}>
                <input
                  className='input-text'
                  type='text'
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                />
                <button
                  className='login-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={handleUpdateBiography}>
                  Save
                </button>
                <button
                  className='delete-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setEditBioMode(false)}>
                  Cancel
                </button>
              </div>
            )}

            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>

            {/* ---- Reset Password Section ---- */}
            {canEditProfile && (
              <>
                <h4>Reset Password</h4>
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='New Password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Confirm New Password'
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
                <button className='toggle-password-button' onClick={togglePasswordVisibility}>
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
                <button className='login-button' onClick={handleResetPassword}>
                  Reset
                </button>
              </>
            )}
            {/* ---- Bookmarks Section ---- */}
            <h4>Bookmarks & Collections</h4>
            <div className='bookmarks-container'>
              <div className='collections-list'>
                <h5>Your Collections</h5>
                {collections.length > 0 ? (
                  collections.map(collection => (
                    <div
                      key={collection._id}
                      className={`collection-item ${activeCollectionId === collection._id ? 'active' : ''}`}
                      onClick={() => loadCollectionBookmarks(collection._id)}>
                      <span>{collection.name}</span>
                      <button
                        className='login-button'
                        onClick={e => {
                          handleGetBookmarksForCollection(collection._id);
                        }}>
                        Open Collection
                      </button>
                      <button
                        className='delete-button small-button'
                        onClick={e => {
                          handleDeleteCollection(collection._id);
                        }}>
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No collections yet.</p>
                )}
                <button className='login-button' onClick={() => setShowCollectionModal(true)}>
                  Create Collection
                </button>
              </div>

              {/* ---- Confirmation Modal for Deleting Collection ---- */}
              {showCollectionConfirmation && (
                <div className='modal'>
                  <div className='modal-content'>
                    <p>
                      Are you sure you want to delete collection{' '}
                      <strong>{activeCollectionId}</strong>? This action cannot be undone.
                    </p>
                    <button
                      className='delete-button'
                      onClick={() => pendingCollectionAction && pendingCollectionAction()}>
                      Confirm
                    </button>
                    <button
                      className='cancel-button'
                      onClick={() => setShowCollectionConfirmation(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className='bookmarks-list'>
                <h5>Bookmarks</h5>
                {allBookmarks.length > 0 ? (
                  allBookmarks.map(bookmark => (
                    <div key={bookmark.questionId} className='bookmark-item'>
                      <a href={`/questions/${bookmark.questionId}`} className='bookmark-link'>
                        {`Question ${bookmark.questionId}`}
                      </a>
                      <button
                        className='delete-button small-button'
                        onClick={e => {
                          handleRemoveBookmark(bookmark.questionId);
                        }}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No bookmarks available.</p>
                )}

                {/* ---- Confirmation Modal for Deleting Bookmark ---- */}
                {showBookmarkConfirmation && (
                  <div className='modal'>
                    <div className='modal-content'>
                      <p>
                        Are you sure you want to delete this bookmark? This action cannot be undone.
                      </p>
                      <button
                        className='delete-button'
                        onClick={() => pendingBookmarkAction && pendingBookmarkAction()}>
                        Confirm
                      </button>
                      <button
                        className='cancel-button'
                        onClick={() => setShowBookmarkConfirmation(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Refresh button for bookmarks */}
                {activeCollectionId && (
                  <button
                    className='login-button'
                    onClick={() => loadBookmarks()}
                    disabled={bookmarksLoading}>
                    Refresh Bookmarks
                  </button>
                )}
              </div>
            </div>

            {/* ---- Collection Modal ---- */}
            {showCollectionModal && (
              <CollectionModal
                onClose={() => setShowCollectionModal(false)}
                onCreateCollection={handleCreateCollection}
              />
            )}

            {/* ---- Danger Zone (Delete User) ---- */}
            {canEditProfile && (
              <>
                <h4>Danger Zone</h4>
                <button className='delete-button' onClick={handleDeleteUser}>
                  Delete This User
                </button>
              </>
            )}
          </>
        ) : (
          <p>No user data found. Make sure the username parameter is correct.</p>
        )}

        {/* ---- Confirmation Modal for Delete ---- */}
        {showConfirmation && (
          <div className='modal'>
            <div className='modal-content'>
              <p>
                Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                action cannot be undone.
              </p>
              <button className='delete-button' onClick={() => pendingAction && pendingAction()}>
                Confirm
              </button>
              <button className='cancel-button' onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
