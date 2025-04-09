import axios from 'axios';
import { DatabaseCollection } from '@fake-stack-overflow/shared/types/collection';
import { Bookmark, DatabaseBookmark } from '@fake-stack-overflow/shared/types/bookmark';

const API_URL = `${process.env.REACT_APP_SERVER_URL}`;

interface BookmarkAddResult extends DatabaseCollection {
  isWarning?: boolean;
  message?: string;
}

/**
 * Fetches all collections for the current user
 * @returns Promise resolving to an array of collections
 */
const fetchCollections = async (username: string) => {
  const response = await axios.get(`${API_URL}/collections/${username}`);
  return response.data;
};

/**
 * Fetches all bookmarks for the current user
 * @param username
 * @returns Promise
 */
const fetchAllBookmarks = async (username: string): Promise<Bookmark[]> => {
  if (!username) {
    throw new Error('Username is required');
  }

  try {
    const response = await axios.get(`${API_URL}/bookmark/${username}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to fetch bookmarks');
    }
    throw new Error('Failed to fetch bookmarks');
  }
};

/**
 * Creates a new collection
 * @param name Collection name
 * @returns Promise resolving to the created collection
 */
const createCollection = async (name: string, username: string): Promise<DatabaseCollection> => {
  try {
    const response = await axios.post(`${API_URL}/collections/${username}`, { name });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to create collection');
    }
    throw new Error('Failed to create collection');
  }
};

/**
 * Deletes a specific collection
 * @param collectionId ID of the collection to delete
 * @returns Promise resolving to the deleted collection
 */
const deleteCollection = async (collectionId: string): Promise<DatabaseCollection> => {
  try {
    const response = await axios.delete(`${API_URL}/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to delete collection');
    }
    throw new Error('Failed to delete collection');
  }
};

/**
 * Fetches bookmarks for a specific collection
 * @param collectionId ID of the collection
 * @returns Promise resolving to an array of bookmarks
 */
const fetchBookmarksForCollection = async (
  collectionId: string,
  username: string,
): Promise<Bookmark[]> => {
  try {
    const response = await axios.get(`${API_URL}/collections/${username}/${collectionId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to fetch bookmarks');
    }
    throw new Error('Failed to fetch bookmarks');
  }
};

/**
 * Adds a bookmark to a collection
 * @param collectionId ID of the collection
 * @param questionId ID of the question to bookmark
 * @returns Promise resolving to the updated collection
 */
const addBookmarkToCollection = async (
  collectionId: string,
  bookmarkId: string,
  username: string,
): Promise<BookmarkAddResult> => {
  try {
    // Convert bookmarkId to string if it's not already
    const bookmarkIdString = String(bookmarkId);

    const response = await axios.post(
      `${API_URL}/collections/${username}/${collectionId}/bookmarks`,
      {
        bookmarkId: bookmarkIdString,
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to add bookmark to collection');
    }
    throw new Error('Failed to add bookmark to collection');
  }
};

/**
 * Adds a bookmark without specifying a collection (default/no collection)
 * @param questionId ID of the question to bookmark
 * @returns Promise resolving to the created bookmark
 */
const addBookmarkWithoutCollection = async (
  questionId: string,
  username: string,
): Promise<DatabaseBookmark> => {
  if (!username) {
    throw new Error('Username is required');
  }

  if (!questionId) {
    throw new Error('Question ID is required');
  }

  try {
    // Convert questionId to string if it's not already
    const questionIdString = String(questionId);
    const response = await axios.post(`${API_URL}/bookmark/${username}`, {
      questionId: questionIdString,
    });

    // Return the response data as is, not converting to string
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to add bookmark');
    }
    throw new Error('Failed to add bookmark');
  }
};

/**
 * Removes a bookmark from a collection
 * @param collectionId The ID of the collection
 * @param questionId The ID of the question to remove
 * @param username The username of the current user
 * @returns Promise resolving to the updated collection
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const removeBookmarkFromCollection = async (
  collectionId: string,
  questionId: string,
  username: string,
): Promise<any> => {
  // Remove from collection
  await axios.delete(`${API_URL}/collections/${username}/${collectionId}/bookmarks/${questionId}`);
  return { success: true, message: 'Bookmark removed' };
};

const removeBookmark = async (username: string, questionId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/bookmark/${username}/${questionId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to remove bookmark');
    }
    throw new Error('Failed to remove bookmark');
  }
};

export {
  fetchCollections,
  fetchAllBookmarks,
  createCollection,
  deleteCollection,
  fetchBookmarksForCollection,
  addBookmarkToCollection,
  addBookmarkWithoutCollection,
  removeBookmark,
  removeBookmarkFromCollection,
};
