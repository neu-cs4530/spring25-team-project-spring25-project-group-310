import axios from 'axios';
import { DatabaseCollection } from '@fake-stack-overflow/shared/types/collection';
import { Bookmark, DatabaseBookmark } from '@fake-stack-overflow/shared/types/bookmark';

const API_URL = `${process.env.REACT_APP_SERVER_URL}`;

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
    console.log(`Fetching all bookmarks for user: ${username}`);
    const response = await axios.get(`${API_URL}/bookmark/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookmarks:', error);
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
const fetchBookmarksForCollection = async (collectionId: string): Promise<Bookmark[]> => {
  try {
    const response = await axios.get(`${API_URL}/collections/${collectionId}/bookmarks`);
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
): Promise<DatabaseCollection> => {
  try {
    const response = await axios.post(
      `${API_URL}/collections/${username}/${collectionId}/bookmarks`,
      {
        bookmarkId,
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
    console.log(
      `Adding bookmark without collection for question: ${questionId}, user: ${username}`,
    );
    const response = await axios.post(`${API_URL}/bookmark/${username}`, { questionId });

    console.log('Bookmark added successfully:', response.data);
    return response.data.toString();
  } catch (error) {
    console.error('Error adding bookmark without collection:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to add bookmark');
    }
    throw new Error('Failed to add bookmark');
  }
};

/**
 * Removes a bookmark from a collection
 * @param collectionId ID of the collection
 * @param questionId ID of the question to remove
 * @returns Promise resolving to the updated collection
 */
const removeBookmarkFromCollection = async (
  collectionId: string,
  bookmarkId: string,
): Promise<DatabaseCollection> => {
  try {
    const response = await axios.delete(
      `${API_URL}/collections/${collectionId}/bookmark/${bookmarkId}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to remove bookmark from collection');
    }
    throw new Error('Failed to remove bookmark from collection');
  }
};

const removeBookmark = async (username: string, bookmarkId: string): Promise<void> => {
  try {
    console.log(`Removing bookmark for bookmark: ${bookmarkId}, user: ${username}`);
    await axios.delete(`${API_URL}/bookmark/${username}/${bookmarkId}`);
  } catch (error) {
    console.error('Error removing bookmark:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to remove bookmark');
    }
    throw new Error('Failed to remove bookmark');
  }
};

const getBookmarksForCollection = async (
  collectionId: string,
  username: string,
): Promise<DatabaseBookmark[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/collections/${username}/${collectionId}/bookmarks`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || 'Server failed to fetch bookmarks in this collection',
      );
    }
    throw new Error('Failed to fetch bookmarks in this collection');
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
