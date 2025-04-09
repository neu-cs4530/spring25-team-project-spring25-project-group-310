import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import CollectionModel from '../../models/collection.model';
import {
  getOrCreateDefaultCollection,
  saveCollection,
  getCollectionsForUser,
  updateCollection,
  deleteCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
  getBookmarksForCollection,
} from '../../services/collection.service';
import { Collection, DatabaseCollection, CollectionResponse } from '../../types/types';

// eslint-disable-next-line
const mockingoose = require('mockingoose');

// Import fail function from Jest
describe('Collection Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  const mockUsername = 'testUser';
  const mockCollection: Collection = {
    name: 'Test Collection',
    username: mockUsername,
    bookmarks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: false,
  };

  const mockDatabaseCollection: DatabaseCollection = {
    _id: new mongoose.Types.ObjectId(),
    name: mockCollection.name,
    username: mockCollection.username,
    bookmarks: mockCollection.bookmarks,
    isDefault: false,
    createdAt: mockCollection.createdAt,
    updatedAt: mockCollection.updatedAt,
  };

  const mockDefaultCollection: DatabaseCollection = {
    _id: new mongoose.Types.ObjectId(),
    name: 'All Bookmarks',
    username: mockUsername,
    bookmarks: [],
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookmarkId = new mongoose.Types.ObjectId().toString();

  // Type guard function to check if a response is a DatabaseCollection
  function isDatabaseCollection(response: CollectionResponse): response is DatabaseCollection {
    return !('error' in response) && !('message' in response);
  }

  describe('getOrCreateDefaultCollection', () => {
    it('should return existing default collection if it exists', async () => {
      mockingoose(CollectionModel).toReturn(mockDefaultCollection, 'findOne');

      const result = await getOrCreateDefaultCollection(mockUsername);

      // Test just the specific properties rather than the whole object
      expect(result.name).toEqual(mockDefaultCollection.name);
      expect(result.username).toEqual(mockDefaultCollection.username);
      expect(result.isDefault).toEqual(mockDefaultCollection.isDefault);
      expect(result.bookmarks).toEqual(mockDefaultCollection.bookmarks);
    });

    it('should create default collection if it does not exist', async () => {
      mockingoose(CollectionModel).toReturn(null, 'findOne');
      mockingoose(CollectionModel).toReturn(mockDefaultCollection, 'create');

      const result = await getOrCreateDefaultCollection(mockUsername);

      // Test just the specific properties rather than the whole object
      expect(result.name).toEqual(mockDefaultCollection.name);
      expect(result.username).toEqual(mockDefaultCollection.username);
      expect(result.isDefault).toEqual(mockDefaultCollection.isDefault);
      expect(result.bookmarks).toEqual(mockDefaultCollection.bookmarks);
    });

    it('should throw error if operation fails', async () => {
      jest.spyOn(CollectionModel, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getOrCreateDefaultCollection(mockUsername)).rejects.toThrow(
        'Error creating default collection: Database error',
      );
    });
  });

  describe('saveCollection', () => {
    it('should return error when saving fails', async () => {
      mockingoose(CollectionModel).toReturn(new Error('Database error'), 'create');
      mockingoose(CollectionModel).toReturn(mockDefaultCollection, 'findOne');

      const result = await saveCollection(mockCollection);
      expect(result).toHaveProperty('error', 'Error when saving a collection');
    });
  });

  describe('getCollectionsForUser', () => {
    it('should return collections for user', async () => {
      // Mock the default collection retrieval
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(mockDefaultCollection);
      // Mock the collections find operation
      jest
        .spyOn(CollectionModel, 'find')
        .mockResolvedValue([mockDefaultCollection, mockDatabaseCollection]);

      const result = await getCollectionsForUser(mockUsername);

      // Check if result is an array without using Array.isArray (which might be giving false negatives)
      expect(result).toBeDefined();
      // Check for error property
      expect('error' in result).toBe(false);

      // If it's not an error, it should be an array
      if (!('error' in result)) {
        expect(result.length).toBe(2);
      }
    });

    it('should return error when fetching fails', async () => {
      // Force a specific error response using Jest's spyOn
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(mockDefaultCollection);
      jest.spyOn(CollectionModel, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await getCollectionsForUser(mockUsername);
      expect(result).toHaveProperty('error', 'Error when fetching collections');
    });
  });

  describe('updateCollection', () => {
    it('should return error when trying to rename default collection', async () => {
      const collectionId = mockDefaultCollection._id.toString();

      // We need to use direct mock implementation for specific behavior
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue({
        ...mockDefaultCollection,
        isDefault: true,
      });

      const result = await updateCollection(collectionId, 'New Name', mockUsername);
      expect(result).toHaveProperty('error', 'Cannot rename default collection');
    });

    it('should return error when collection not found', async () => {
      // Updated mocking approach for findOne + findOneAndUpdate
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(CollectionModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await updateCollection('invalidId', 'New Name', mockUsername);
      expect(result).toHaveProperty('error', 'Collection not found');
    });

    it('should return error when update fails', async () => {
      // Force a specific error using Jest's spyOn
      jest.spyOn(CollectionModel, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await updateCollection('someId', 'New Name', mockUsername);
      expect(result).toHaveProperty('error', 'Error when updating collection');
    });
  });

  describe('deleteCollection', () => {
    it('should return error when collection not found', async () => {
      // Use direct jest mocking for more control
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(null);

      const result = await deleteCollection('invalidId', mockUsername);
      expect(result).toHaveProperty('error', 'Collection not found');
    });

    it('should return error when trying to delete default collection', async () => {
      const collectionId = mockDefaultCollection._id.toString();
      // Use direct jest mocking
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue({
        ...mockDefaultCollection,
        isDefault: true,
      });

      const result = await deleteCollection(collectionId, mockUsername);
      expect(result).toHaveProperty('error', 'Cannot delete default collection');
    });

    it('should return error when deletion fails', async () => {
      const collectionId = mockDatabaseCollection._id.toString();

      // Use direct jest mocking for precise control
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(mockDatabaseCollection);
      jest.spyOn(CollectionModel, 'findOneAndDelete').mockResolvedValue(null);

      const result = await deleteCollection(collectionId, mockUsername);
      expect(result).toHaveProperty('error', 'Failed to delete collection');
    });

    it('should return error when operation fails', async () => {
      // Force a specific error using Jest's spyOn
      jest.spyOn(CollectionModel, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await deleteCollection('someId', mockUsername);
      expect(result).toHaveProperty('error', 'Error when deleting collection');
    });
  });

  describe('addBookmarkToCollection', () => {
    it('should add bookmark to collection', async () => {
      const collectionId = mockDatabaseCollection._id.toString();
      const updatedCollection = {
        ...mockDatabaseCollection,
        bookmarks: [mockBookmarkId],
      };

      // Use direct jest mocking for more control
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(CollectionModel, 'findOneAndUpdate').mockResolvedValue(updatedCollection);

      const result = await addBookmarkToCollection(collectionId, mockBookmarkId, mockUsername);

      if ('error' in result) {
        fail(result.error);
      } else if ('message' in result) {
        fail('Expected a collection, got a message response');
      } else {
        expect(result.bookmarks).toContain(mockBookmarkId);
      }
    });

    it('should return message when bookmark already exists in collection', async () => {
      const collectionId = mockDatabaseCollection._id.toString();
      const collectionWithBookmark = {
        ...mockDatabaseCollection,
        bookmarks: [mockBookmarkId],
      };

      // Direct jest mocking
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(collectionWithBookmark);

      const result = await addBookmarkToCollection(collectionId, mockBookmarkId, mockUsername);
      expect(result).toHaveProperty('message', 'Bookmark already exists in this collection');
      expect(result).toHaveProperty('isWarning', true);
      expect(result).toHaveProperty('collection');
    });

    it('should return error when collection not found', async () => {
      // Direct jest mocking
      jest.spyOn(CollectionModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(CollectionModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await addBookmarkToCollection('invalidId', mockBookmarkId, mockUsername);
      expect(result).toHaveProperty('error', 'Collection not found or failed to add bookmark');
    });

    it('should return error when operation fails', async () => {
      // Force a specific error using Jest's spyOn
      jest.spyOn(CollectionModel, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await addBookmarkToCollection('someId', mockBookmarkId, mockUsername);
      expect(result).toHaveProperty(
        'error',
        'Error when adding bookmark to collection: Database error',
      );
    });
  });

  describe('removeBookmarkFromCollection', () => {
    it('should remove bookmark from collection', async () => {
      const collectionId = mockDatabaseCollection._id.toString();
      const updatedCollection = {
        ...mockDatabaseCollection,
        bookmarks: [],
      };

      // Use direct Jest mocking instead of mockingoose
      jest.spyOn(CollectionModel, 'findOneAndUpdate').mockResolvedValue(updatedCollection);

      const result = await removeBookmarkFromCollection(collectionId, mockBookmarkId, mockUsername);

      if ('error' in result) {
        fail(result.error);
      } else {
        expect(isDatabaseCollection(result)).toBe(true);
        if (isDatabaseCollection(result)) {
          expect(result.bookmarks).not.toContain(mockBookmarkId);
        }
      }
    });

    it('should return error when collection not found', async () => {
      // Direct jest mocking
      jest.spyOn(CollectionModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await removeBookmarkFromCollection('invalidId', mockBookmarkId, mockUsername);
      expect(result).toHaveProperty('error', 'Collection not found or failed to remove bookmark');
    });

    it('should return error when operation fails', async () => {
      // Force a specific error using Jest's spyOn
      jest.spyOn(CollectionModel, 'findOneAndUpdate').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await removeBookmarkFromCollection('someId', mockBookmarkId, mockUsername);
      expect(result).toHaveProperty(
        'error',
        'Error when removing bookmark from collection: Database error',
      );
    });
  });

  describe('getBookmarksForCollection', () => {
    it('should return bookmarks for collection', async () => {
      const collectionId = mockDatabaseCollection._id.toString();
      const collectionWithBookmarks = {
        ...mockDatabaseCollection,
        bookmarks: [new ObjectId(mockBookmarkId)],
      };

      // Use direct jest mocking
      jest.spyOn(CollectionModel, 'findById').mockResolvedValue(collectionWithBookmarks);

      const result = await getBookmarksForCollection(collectionId);

      // Verify it doesn't have an error property
      expect('error' in result).toBe(false);

      // If no error, it should be the bookmarks array
      if (!('error' in result)) {
        expect(result.length).toBe(1);
        expect(String(result[0])).toEqual(mockBookmarkId);
      }
    });

    it('should return error when collection not found', async () => {
      // Direct jest mocking
      jest.spyOn(CollectionModel, 'findById').mockResolvedValue(null);

      const result = await getBookmarksForCollection('invalidId');
      expect(result).toHaveProperty('error', 'Collection not found');
    });

    it('should return error when operation fails', async () => {
      // Force a specific error using Jest's spyOn
      jest.spyOn(CollectionModel, 'findById').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await getBookmarksForCollection('someId');
      expect(result).toHaveProperty('error', 'Error when fetching bookmarks in collection');
    });
  });
});
