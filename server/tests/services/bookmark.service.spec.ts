import mongoose from 'mongoose';
import BookmarkModel from '../../models/bookmark.model';
import CollectionModel from '../../models/collection.model';
import * as collectionService from '../../services/collection.service';
import { saveBookmark, getBookmarksForUser, deleteBookmark } from '../../services/bookmark.service';
import { Bookmark, DatabaseBookmark, BookmarkResponse } from '../../types/types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Bookmark Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  const mockBookmark: Bookmark = {
    username: 'testUser',
    questionId: new mongoose.Types.ObjectId().toString(),
    createdAt: new Date(),
  };

  const mockDatabaseBookmark: DatabaseBookmark = {
    _id: new mongoose.Types.ObjectId(),
    username: mockBookmark.username,
    questionId: mockBookmark.questionId,
    createdAt: mockBookmark.createdAt,
  };

  const mockDefaultCollection = {
    _id: new mongoose.Types.ObjectId(),
    name: 'All Bookmarks',
    username: 'testUser',
    bookmarks: [],
    isDefault: true,
  };

  describe('saveBookmark', () => {
    it('should save and return the bookmark', async () => {
      mockingoose(BookmarkModel).toReturn(mockDatabaseBookmark, 'create');

      jest
        .spyOn(collectionService, 'getOrCreateDefaultCollection')
        .mockResolvedValue(mockDefaultCollection);

      mockingoose(CollectionModel).toReturn(mockDefaultCollection, 'findOneAndUpdate');

      const result: BookmarkResponse = await saveBookmark(mockBookmark);
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result).toHaveProperty('_id');
        expect(result.username).toEqual(mockBookmark.username);
        expect(result.questionId.toString()).toEqual(mockBookmark.questionId);
      }

      expect(collectionService.getOrCreateDefaultCollection).toHaveBeenCalledWith(
        mockBookmark.username,
      );
    });

    it('should return an error when saving a bookmark fails', async () => {
      jest.spyOn(BookmarkModel, 'create').mockImplementation(() => {
        throw new Error('Failed to create bookmark');
      });

      const result = await saveBookmark(mockBookmark);
      expect(result).toHaveProperty('error', 'Error when saving a bookmark');
    });
  });

  describe('getBookmarksForUser', () => {
    it('should return an array of bookmarks for the given username', async () => {
      mockingoose(BookmarkModel).toReturn([mockDatabaseBookmark], 'find');

      const result = (await getBookmarksForUser(
        mockBookmark.username,
      )) as unknown as DatabaseBookmark;
      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].username).toEqual('testUser');
      }
    });

    it('should return an error if fetching bookmarks fails', async () => {
      mockingoose(BookmarkModel).toReturn(new Error('Error fetching bookmarks'), 'find');

      const result: BookmarkResponse[] | { error: string } = await getBookmarksForUser('testUser');
      expect(result).toHaveProperty('error', 'Error when fetching bookmarks');
    });
  });

  describe('deleteBookmark', () => {
    it('should delete the bookmark from the database and default collection', async () => {
      mockingoose(BookmarkModel).toReturn(mockDatabaseBookmark, 'findOne');

      mockingoose(BookmarkModel).toReturn(mockDatabaseBookmark, 'findOneAndDelete');

      jest
        .spyOn(collectionService, 'getOrCreateDefaultCollection')
        .mockResolvedValue(mockDefaultCollection);

      mockingoose(CollectionModel).toReturn(
        {
          ...mockDefaultCollection,
          bookmarks: mockDefaultCollection.bookmarks.filter(id => id !== mockBookmark.questionId),
        },
        'findOneAndUpdate',
      );

      const result = await deleteBookmark(mockBookmark.questionId, mockBookmark.username);

      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result._id).toBeDefined();
        expect(result.username).toEqual(mockBookmark.username);

        expect(String(result.questionId)).toEqual(String(mockBookmark.questionId));
      }

      expect(collectionService.getOrCreateDefaultCollection).toHaveBeenCalledWith(
        mockBookmark.username,
      );
    });

    it('should return an error if bookmark is not found during search', async () => {
      mockingoose(BookmarkModel).toReturn(null, 'findOne');

      const result = await deleteBookmark('nonExistentQuestionId', 'testUser');
      expect(result).toHaveProperty('error', 'Bookmark not found');
    });

    it('should return an error if bookmark is not found during deletion', async () => {
      mockingoose(BookmarkModel).toReturn(mockDatabaseBookmark, 'findOne');

      mockingoose(BookmarkModel).toReturn(null, 'findOneAndDelete');

      jest
        .spyOn(collectionService, 'getOrCreateDefaultCollection')
        .mockResolvedValue(mockDefaultCollection);

      const result = await deleteBookmark(mockBookmark.questionId, mockBookmark.username);
      expect(result).toHaveProperty('error', 'Bookmark not found');
    });

    it('should return an error when deleting a bookmark fails', async () => {
      // Use a jest spy to properly mock the error
      jest.spyOn(BookmarkModel, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await deleteBookmark(mockBookmark.questionId, mockBookmark.username);
      expect(result).toHaveProperty('error', 'Error when deleting bookmark');
    });
  });
});
