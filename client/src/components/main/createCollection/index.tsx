import React, { useState } from 'react';
import { saveCollection } from '../../../services/collectionService';
import { Collection } from '../../../types/types';

interface CreateCollectionProps {
  onCollectionCreated?: (collection: Collection) => void;
  onClose?: () => void;
  username: string;
}

const CreateCollection: React.FC<CreateCollectionProps> = ({
  onCollectionCreated,
  onClose,
  username,
}) => {
  const [collectionName, setCollectionName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCollection = async () => {
    // Validate collection name
    if (!collectionName.trim()) {
      setError('Collection name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newCollection: Collection = {
        name: collectionName.trim(),
        username,
        bookmarks: [],
        isDefault: false,
      };

      const createdCollection = await saveCollection(newCollection, username);

      // Call the callback if provided
      if (onCollectionCreated) {
        onCollectionCreated(createdCollection);
      }

      // Reset form and close
      setCollectionName('');
      if (onClose) {
        onClose();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create collection';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='create-collection-modal'>
      <div className='modal-content'>
        <h2>Create New Collection</h2>
        <input
          type='text'
          placeholder='Enter collection name'
          value={collectionName}
          onChange={e => setCollectionName(e.target.value)}
          disabled={isLoading}
        />
        {error && <p className='error-message'>{error}</p>}
        <div className='modal-actions'>
          <button onClick={handleCreateCollection} disabled={isLoading} className='create-btn'>
            {isLoading ? 'Creating...' : 'Create Collection'}
          </button>
          <button onClick={onClose} className='cancel-btn' disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCollection;
