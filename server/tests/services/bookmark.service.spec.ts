import mongoose from 'mongoose';
import BookmarkModel from '../../models/bookmark.model';
import { saveBookmark, getBookmarksForUser, deleteBookmark } from '../../services/bookmark.service';
import { Bookmark, DatabaseBookmark, BookmarkResponse } from '../../types/types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Bookmark Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
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

  describe('saveBookmark', () => {
    it('should save and return the bookmark', async () => {
      mockingoose(BookmarkModel).toReturn(mockDatabaseBookmark, 'create');

      const result: BookmarkResponse = await saveBookmark(mockBookmark);
      if ('error' in result) {
        fail(result.error);
      } else {
        expect(result).toHaveProperty('_id');
        expect(result.username).toEqual(mockBookmark.username);
        expect(result.questionId.toString()).toEqual(mockBookmark.questionId);
      }
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
    it('should return an error if bookmark is not found', async () => {
      mockingoose(BookmarkModel).toReturn(null, 'findOneAndDelete');

      const result: BookmarkResponse = await deleteBookmark('invalidBookmarkId', 'testUser');
      expect(result).toHaveProperty('error', 'Bookmark not found');
    });
  });
});
