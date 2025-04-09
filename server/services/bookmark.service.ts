import { Bookmark, BookmarkResponse, DatabaseBookmark } from '../types/types';
import BookmarkModel from '../models/bookmark.model';
import CollectionModel from '../models/collection.model';
import { getOrCreateDefaultCollection } from './collection.service';

/**
 * Saves a new bookmark to the database and adds it to the default collection.
 * @param {Bookmark} bookmark - The bookmark to save.
 * @returns {Promise<BookmarkResponse>} - The saved bookmark or an error message.
 */
export const saveBookmark = async (bookmark: Bookmark): Promise<BookmarkResponse> => {
  try {
    // Create the bookmark
    const result: DatabaseBookmark = await BookmarkModel.create(bookmark);

    // Get or create the default "All Bookmarks" collection
    const defaultCollection = await getOrCreateDefaultCollection(bookmark.username);

    // Add the bookmark to the default collection
    await CollectionModel.findByIdAndUpdate(
      defaultCollection._id,
      { $addToSet: { bookmarks: bookmark.questionId } },
      { new: true },
    );

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
  questionId: string,
  username: string,
): Promise<BookmarkResponse> => {
  try {
    // Try to find the bookmark first
    const existingBookmark = await BookmarkModel.findOne({
      questionId,
      username,
    });

    // If no bookmark is found, return an error
    if (!existingBookmark) {
      return { error: 'Bookmark not found' };
    }

    // Delete the bookmark
    const deletedBookmark = await BookmarkModel.findOneAndDelete({
      questionId,
      username,
    });

    const defaultCollection = await getOrCreateDefaultCollection(username);
    await CollectionModel.findByIdAndUpdate(
      defaultCollection._id,
      { $pull: { bookmarks: questionId } },
      { new: true },
    );
    return deletedBookmark || { error: 'Bookmark not found' };
  } catch (error) {
    return { error: 'Error when deleting bookmark' };
  }
};
