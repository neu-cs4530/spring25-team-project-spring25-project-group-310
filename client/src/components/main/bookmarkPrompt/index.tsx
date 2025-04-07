import React, { useState, useEffect } from 'react';
import {
  fetchCollections,
  addBookmarkToCollection,
  createCollection,
} from '../../../services/bookmarkService';
import useUserContext from '../../../hooks/useUserContext';

interface BookmarkPromptProps {
  questionId: string;
  onClose: () => void;
  onSuccess: () => void;
  username: string;
}

interface BookmarkResult {
  isWarning?: boolean;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection?: any;
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
  const { user } = useUserContext();

  // Fetch existing collections when component mounts
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const fetchedCollections = await fetchCollections(username);
        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Error fetching collections:', err);
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

      if (collectionName.trim() && !selectedCollectionId) {
        // Create a new collection and add bookmark to it
        const newCollection = await createCollection(collectionName.trim(), username);
        await addBookmarkToCollection(newCollection._id.toString(), questionIdString, username);
      }
      // If only an existing collection is selected
      else if (selectedCollectionId) {
        const result = await addBookmarkToCollection(
          selectedCollectionId,
          questionIdString,
          username,
        );

        // Type guard check
        if (result && typeof result === 'object' && 'isWarning' in result) {
          console.log(result.message); // Log the warning but don't show it as an error
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Bookmark failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='collection-modal'>
      <h3>Add to Collection</h3>
      {/* Existing Collections Dropdown */}
      <select
        value={selectedCollectionId || ''}
        onChange={e => {
          setSelectedCollectionId(e.target.value);
        }}
        className='input-text'>
        <option value=''>Select an existing collection</option>
        {collections.map(collection => (
          <option key={collection._id} value={collection._id}>
            {collection.name}
          </option>
        ))}
      </select>

      <div style={{ margin: '10px 0', textAlign: 'center' }}>— OR —</div>
      <input
        type='text'
        value={collectionName}
        onChange={e => {
          setCollectionName(e.target.value);
          setError('');
        }}
        placeholder='Create a new collection'
        className='input-text'
      />
      {error && <p className='error-message'>{error}</p>}
      <div className='modal-actions'>
        <button onClick={handleBookmark} className='login-button' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Bookmark'}
        </button>
        <button onClick={onClose} className='cancel-button' disabled={isLoading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BookmarkPrompt;
