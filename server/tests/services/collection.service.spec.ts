/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import CollectionModel from '../../models/collection.model';
import {
  saveCollection,
  getCollectionsForUser,
  updateCollection,
  deleteCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
} from '../../services/collection.service';
import { Collection, DatabaseCollection, CollectionResponse } from '../../types/types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Collection Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  const collectionId = new mongoose.Types.ObjectId().toString();
  const mockCollection: Collection = {
    username: 'testUser',
    name: 'Custom Collection',
    bookmarks: [],
    isDefault: false,
    createdAt: new Date(),
  };

  const mockDatabaseCollection: DatabaseCollection = {
    _id: new mongoose.Types.ObjectId(),
    username: mockCollection.username,
    name: mockCollection.name,
    bookmarks: [],
    isDefault: mockCollection.isDefault,
    createdAt: mockCollection.createdAt,
  };

  describe('saveCollection', () => {
    it('should save and return the collection', async () => {
      mockingoose(CollectionModel).toReturn(mockDatabaseCollection, 'create');

      const result: CollectionResponse = await saveCollection(mockCollection);
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result).toHaveProperty('_id');
        expect(result.username).toEqual('testUser');
        expect(result.name).toEqual(mockCollection.name);
      }
    });

    // it('should return an error if saving fails', async () => {
    //   mockingoose(CollectionModel).toReturn(new Error('Error saving collection'), 'create');

    //   const result: CollectionResponse = await saveCollection(mockCollection);
    //   expect(result).toHaveProperty('error', 'Error when saving a collection');
    // });
  });

  describe('getCollectionsForUser', () => {
    it('should return an array of collections for the given username', async () => {
      mockingoose(CollectionModel).toReturn([mockDatabaseCollection], 'find');

      const result = (await getCollectionsForUser('testUser')) as unknown as DatabaseCollection[];
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].username).toEqual('testUser');
      }
    });

    it('should return an error if fetching collections fails', async () => {
      mockingoose(CollectionModel).toReturn(new Error('Error fetching collections'), 'find');

      const result: CollectionResponse[] | { error: string } =
        await getCollectionsForUser('testUser');
      expect(result).toHaveProperty('error', 'Error when fetching collections');
    });
  });

  describe('updateCollection', () => {
    it('should update and return the collection', async () => {
      const updatedName = 'Updated Collection';
      const updatedCollection = { ...mockDatabaseCollection, name: updatedName };
      mockingoose(CollectionModel).toReturn(updatedCollection, 'findOneAndUpdate');

      const result: CollectionResponse = await updateCollection(
        collectionId,
        updatedName,
        'testUser',
      );
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result.name).toEqual(updatedName);
      }
    });

    it('should return an error if collection not found', async () => {
      mockingoose(CollectionModel).toReturn(null, 'findOneAndUpdate');

      const result: CollectionResponse = await updateCollection(
        collectionId,
        'New Name',
        'testUser',
      );
      expect(result).toHaveProperty('error', 'Collection not found');
    });
  });

  describe('deleteCollection', () => {
    it('should delete and return the collection', async () => {
      mockingoose(CollectionModel).toReturn(mockDatabaseCollection, 'findOne');
      mockingoose(CollectionModel).toReturn(mockDatabaseCollection, 'findOneAndDelete');

      const result: CollectionResponse = await deleteCollection(collectionId, 'testUser');
      if ('error' in result) {
        throw new Error(result.error);
      } else {
        expect(result).toHaveProperty('_id');
        expect(result.username).toEqual('testUser');
      }
    });

    it('should return an error if collection not found', async () => {
      mockingoose(CollectionModel).toReturn(null, 'findOne');

      const result: CollectionResponse = await deleteCollection(collectionId, 'testUser');
      expect(result).toHaveProperty('error', 'Collection not found');
    });

    it('should return an error if collection is default', async () => {
      const defaultCollection = { ...mockDatabaseCollection, isDefault: true };
      mockingoose(CollectionModel).toReturn(defaultCollection, 'findOne');

      const result: CollectionResponse = await deleteCollection(collectionId, 'testUser');
      expect(result).toHaveProperty('error', 'Cannot delete default collection');
    });
  });

  describe('addBookmarkToCollection', () => {
    it('should add a bookmark to the collection', async () => {
      const bookmarkId = new mongoose.Types.ObjectId().toString();
      const updatedCollection = { ...mockDatabaseCollection, bookmarks: [bookmarkId] };
      mockingoose(CollectionModel).toReturn(updatedCollection, 'findOneAndUpdate');

      const result: CollectionResponse = await addBookmarkToCollection(
        collectionId,
        bookmarkId,
        'testUser',
      );
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result.bookmarks.map(String)).toContain(bookmarkId);
      }
    });

    it('should return an error if collection not found or addition fails', async () => {
      mockingoose(CollectionModel).toReturn(null, 'findOneAndUpdate');
      const bookmarkId = new mongoose.Types.ObjectId().toString();

      const result: CollectionResponse = await addBookmarkToCollection(
        collectionId,
        bookmarkId,
        'testUser',
      );
      expect(result).toHaveProperty('error', 'Collection not found or failed to add bookmark');
    });
  });

  describe('removeBookmarkFromCollection', () => {
    it('should remove a bookmark from the collection', async () => {
      const bookmarkId = new mongoose.Types.ObjectId().toString();
      // Simulate a collection that already has the bookmark, then returns the collection with it removed.
      const updatedCollection = { ...mockDatabaseCollection, bookmarks: [] };
      mockingoose(CollectionModel).toReturn(updatedCollection, 'findOneAndUpdate');

      const result: CollectionResponse = await removeBookmarkFromCollection(
        collectionId,
        bookmarkId,
        'testUser',
      );
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result.bookmarks).not.toContain(bookmarkId);
      }
    });

    it('should return an error if removal fails or collection not found', async () => {
      mockingoose(CollectionModel).toReturn(null, 'findOneAndUpdate');
      const bookmarkId = new mongoose.Types.ObjectId().toString();

      const result: CollectionResponse = await removeBookmarkFromCollection(
        collectionId,
        bookmarkId,
        'testUser',
      );
      expect(result).toHaveProperty('error', 'Collection not found or failed to remove bookmark');
    });
  });
});
