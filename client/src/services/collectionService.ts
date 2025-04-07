import axios from 'axios';
import { ObjectId } from 'mongodb';
import { Collection } from '../types/types';
import api from './config';

const COLLECTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/collections`;

/**
 * Creates a new collection for the user.
 *
 * @param collection The collection data to be created
 * @returns Promise resolving to the created collection
 * @throws {Error} If there's an issue creating the collection
 */
const saveCollection = async (collection: Collection, username: string): Promise<Collection> => {
  try {
    const res = await api.post(`${COLLECTION_API_URL}/${username}`, collection);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error creating collection: ${error.response.data}`);
    } else {
      throw new Error('Error creating collection');
    }
  }
};

/**
 * Retrieves all collections for a specific user.
 *
 * @returns Promise resolving to an array of collections
 * @throws {Error} If there's an issue fetching collections
 */
const getCollectionsForUser = async (username: string): Promise<Collection[]> => {
  try {
    const res = await api.get(`${COLLECTION_API_URL}/${username}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error fetching collections: ${error.response.data}`);
    } else {
      throw new Error('Error fetching collections');
    }
  }
};

/**
 * Get bookmarks for a specific collection.
 * @param collectionId The ID of the collection
 * @param username The username of the user
 * @returns Promise resolving to an array of bookmarks
 * @throws {Error} If there's an issue fetching bookmarks
 */
const getBookmarksForCollection = async (
  collectionId: string,
  username: string,
): Promise<ObjectId[]> => {
  try {
    const res = await api.get(`${COLLECTION_API_URL}/${username}/${collectionId}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error fetching bookmarks: ${error.response.data}`);
    } else {
      throw new Error('Error fetching bookmarks');
    }
  }
};

/**
 * Updates a collection's name.
 *
 * @param collectionId The ID of the collection to update
 * @param newName The new name for the collection
 * @returns Promise resolving to the updated collection
 * @throws {Error} If there's an issue updating the collection
 */
const updateCollection = async (
  collectionId: string,
  newName: string,
  username: string,
): Promise<Collection> => {
  try {
    const res = await api.put(`${COLLECTION_API_URL}/${username}/${collectionId}`, {
      name: newName,
    });
    return res.data.collection;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error updating collection: ${error.response.data}`);
    } else {
      throw new Error('Error updating collection');
    }
  }
};

/**
 * Deletes a collection.
 *
 * @param collectionId The ID of the collection to delete
 * @returns Promise resolving to the deleted collection
 * @throws {Error} If there's an issue deleting the collection
 */
const deleteCollection = async (collectionId: string, username: string): Promise<Collection> => {
  try {
    const res = await api.delete(`${COLLECTION_API_URL}/${username}/${collectionId}`);
    return res.data.collection;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error deleting collection: ${error.response.data}`);
    } else {
      throw new Error('Error deleting collection');
    }
  }
};

/**
 * Adds a bookmark to a collection.
 *
 * @param collectionId The ID of the collection
 * @param bookmarkId The ID of the bookmark to add
 * @returns Promise resolving to the updated collection
 * @throws {Error} If there's an issue adding the bookmark
 */
const addBookmarkToCollection = async (
  collectionId: string,
  bookmarkId: string,
  username: string,
): Promise<Collection> => {
  try {
    const res = await api.post(`${COLLECTION_API_URL}/${username}/${collectionId}/bookmarks`, {
      bookmarkId,
    });
    return res.data.collection;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error adding bookmark to collection: ${error.response.data}`);
    } else {
      throw new Error('Error adding bookmark to collection');
    }
  }
};

/**
 * Removes a bookmark from a collection.
 *
 * @param collectionId The ID of the collection
 * @param bookmarkId The ID of the bookmark to remove
 * @returns Promise resolving to the updated collection
 * @throws {Error} If there's an issue removing the bookmark
 */
const removeBookmarkFromCollection = async (
  collectionId: string,
  bookmarkId: string,
): Promise<Collection> => {
  try {
    const res = await api.delete(`${COLLECTION_API_URL}/${collectionId}/bookmarks/${bookmarkId}`);
    return res.data.collection;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error removing bookmark from collection: ${error.response.data}`);
    } else {
      throw new Error('Error removing bookmark from collection');
    }
  }
};

export {
  saveCollection,
  getCollectionsForUser,
  getBookmarksForCollection,
  updateCollection,
  deleteCollection,
  removeBookmarkFromCollection,
};
