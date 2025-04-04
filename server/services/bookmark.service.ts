import { Bookmark, BookmarkResponse, DatabaseBookmark } from '../types/types';
import BookmarkModel from '../models/bookmark.model';

/**
 * Saves a new bookmark to the database.
 * @param {Bookmark} bookmark - The bookmark to save.
 * @returns {Promise<BookmarkResponse>} - The saved bookmark or an error message.
 */
export const saveBookmark = async (bookmark: Bookmark): Promise<BookmarkResponse> => {
  try {
    const result: DatabaseBookmark = await BookmarkModel.create(bookmark);
    return result;
  } catch (error) {
    return { error: 'Error when saving a bookmark' };
  }
};

/**
 * Retrieves all bookmarks for a given username.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<BookmarkResponse[]>} - An array of bookmarks or an error message.
 */
export const getBookmarksForUser = async (
  username: string,
): Promise<BookmarkResponse[] | { error: string }> => {
  try {
    const bookmarks: DatabaseBookmark[] = await BookmarkModel.find({ username });
    return bookmarks;
  } catch (error) {
    return { error: 'Error when fetching bookmarks' };
  }
};

/**
 * Deletes a bookmark from the database.
 * @param {string} bookmarkId - The ID of the bookmark to delete.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<BookmarkResponse>} - The deleted bookmark or an error message.
 */
export const deleteBookmark = async (
  bookmarkId: string,
  username: string,
): Promise<BookmarkResponse> => {
  try {
    const deletedBookmark: DatabaseBookmark | null = await BookmarkModel.findOneAndDelete({
      questionId: bookmarkId,
      username,
    });
    if (!deletedBookmark) {
      return { error: 'Bookmark not found' };
    }
    return deletedBookmark;
  } catch (error) {
    return { error: 'Error when deleting bookmark' };
  }
};
