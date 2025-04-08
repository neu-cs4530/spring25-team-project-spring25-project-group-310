import React, { useState, useEffect } from 'react';
import {
  fetchCollections,
  addBookmarkToCollection,
  createCollection,
} from '../../../services/bookmarkService';
import './index.css';

interface BookmarkPromptProps {
  questionId: string;
  onClose: () => void;
  onSuccess: () => void;
  username: string;
}

const BookmarkPrompt: React.FC<BookmarkPromptProps> = ({
  questionId,
  onClose,
  onSuccess,
  username,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'select' | 'create'>('select');

  // Fetch existing collections when component mounts
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const fetchedCollections = await fetchCollections(username);
        setCollections(fetchedCollections);
      } catch (err) {
        setError('Failed to load collections');
      }
    };
    loadCollections();
  }, [username]);

  const handleBookmark = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Ensure questionId is a string
      const questionIdString = String(questionId);

      if (mode === 'create' && collectionName.trim()) {
        // Create a new collection and add bookmark to it
        const newCollection = await createCollection(collectionName.trim(), username);
        await addBookmarkToCollection(newCollection._id.toString(), questionIdString, username);
      }
      // If only an existing collection is selected
      else if (mode === 'select' && selectedCollectionId) {
        await addBookmarkToCollection(selectedCollectionId, questionIdString, username);
      } else {
        setError('Please select a collection or create a new one');
        setIsLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bookmark-modal-overlay' onClick={onClose}>
      <div className='bookmark-modal' onClick={e => e.stopPropagation()}>
        <div className='bookmark-modal-header'>
          <h3>Save to Collection</h3>
          <button className='close-modal-btn' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='bookmark-modal-content'>
          <div className='bookmark-tabs'>
            <button
              className={`bookmark-tab ${mode === 'select' ? 'active' : ''}`}
              onClick={() => setMode('select')}>
              Existing Collection
            </button>
            <button
              className={`bookmark-tab ${mode === 'create' ? 'active' : ''}`}
              onClick={() => setMode('create')}>
              New Collection
            </button>
          </div>

          {mode === 'select' && (
            <div className='collection-selection'>
              {collections.length === 0 ? (
                <div className='no-collections'>
                  <p>You do not have any collections yet.</p>
                  <button className='switch-to-create-btn' onClick={() => setMode('create')}>
                    Create your first collection
                  </button>
                </div>
              ) : (
                <div className='collections-list'>
                  {collections.map(collection => (
                    <div
                      key={collection._id}
                      className={`collection-option ${selectedCollectionId === collection._id ? 'selected' : ''}`}
                      onClick={() => setSelectedCollectionId(collection._id)}>
                      <div className='collection-icon'>
                        {collection.name.charAt(0).toUpperCase()}
                      </div>
                      <div className='collection-option-info'>
                        <div className='collection-option-name'>{collection.name}</div>
                        <div className='collection-option-count'>
                          {collection.bookmarks?.length || 0} bookmarks
                        </div>
                      </div>
                      {selectedCollectionId === collection._id && (
                        <div className='check-icon'>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'create' && (
            <div className='create-collection-form'>
              <label htmlFor='collection-name'>Collection name</label>
              <input
                id='collection-name'
                type='text'
                value={collectionName}
                onChange={e => setCollectionName(e.target.value)}
                placeholder='Enter collection name'
                className='collection-name-input'
                autoFocus
              />
            </div>
          )}

          {error && <div className='bookmark-error-message'>{error}</div>}
        </div>

        <div className='bookmark-modal-actions'>
          <button className='cancel-bookmark-btn' onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className='save-bookmark-btn'
            onClick={handleBookmark}
            disabled={
              isLoading ||
              (mode === 'select' && !selectedCollectionId) ||
              (mode === 'create' && !collectionName.trim())
            }>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkPrompt;
