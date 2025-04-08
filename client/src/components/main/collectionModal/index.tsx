import React, { useState } from 'react';
import './index.css';

interface CollectionModalProps {
  onClose: () => void;
  onCreateCollection: (collectionName: string) => Promise<void>;
}

const CollectionModal: React.FC<CollectionModalProps> = ({ onClose, onCreateCollection }) => {
  const [collectionName, setCollectionName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCollection = async () => {
    // Validate input
    if (!collectionName.trim()) {
      setError('Collection name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateCollection(collectionName);
      onClose();
    } catch (err) {
      setError('Failed to create collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='modal'>
      <div className='modal-content'>
        <div style={{ margin: '10px 0', textAlign: 'center' }}>— New Collection —</div>
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
          <button onClick={handleCreateCollection} className='login-button' disabled={isLoading}>
            {isLoading ? 'Creating Collection...' : 'Create a Collection'}
          </button>
          <button onClick={onClose} className='cancel-button' disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
