// eslint-disable-next-line import/no-extraneous-dependencies
import { ObjectId } from 'mongodb';
import { Collection, CollectionResponse, DatabaseCollection } from '../types/types';
import CollectionModel from '../models/collection.model';

/**
 * Saves a new collection to the database.
 * @param {Collection} collection - The collection to save.
 * @returns {Promise<CollectionResponse>} - The saved collection or an error message.
 */
export const saveCollection = async (collection: Collection): Promise<CollectionResponse> => {
  try {
    const result: DatabaseCollection = await CollectionModel.create(collection);
    return result;
  } catch (error) {
    return { error: 'Error when saving a collection' };
  }
};

/**
 * Retrieves all collections for a given username.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<CollectionResponse[]>} - An array of collections or an error message.
 */
export const getCollectionsForUser = async (
  username: string,
): Promise<CollectionResponse[] | { error: string }> => {
  try {
    const collections: DatabaseCollection[] = await CollectionModel.find({ username });
    return collections;
  } catch (error) {
    return { error: 'Error when fetching collections' };
  }
};

/**
 * Updates a collection's name in the database.
 * @param {string} collectionId - The ID of the collection to update.
 * @param {string} name - The new name for the collection.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<CollectionResponse>} - The updated collection or an error message.
 */
export const updateCollection = async (
  collectionId: string,
  name: string,
  username: string,
): Promise<CollectionResponse> => {
  try {
    const updatedCollection: DatabaseCollection | null = await CollectionModel.findOneAndUpdate(
      { _id: collectionId, username },
      { name, updatedAt: new Date() },
      { new: true },
    );
    if (!updatedCollection) {
      return { error: 'Collection not found' };
    }
    return updatedCollection;
  } catch (error) {
    return { error: 'Error when updating collection' };
  }
};

/**
 * Deletes a collection from the database.
 * Prevents deletion of the default "All Bookmarks" collection.
 * @param {string} collectionId - The ID of the collection to delete.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<CollectionResponse>} - The deleted collection or an error message.
 */
export const deleteCollection = async (
  collectionId: string,
  username: string,
): Promise<CollectionResponse> => {
  try {
    const collection = await CollectionModel.findOne({ _id: collectionId, username });
    if (!collection) {
      return { error: 'Collection not found' };
    }
    if (collection.isDefault) {
      return { error: 'Cannot delete default collection' };
    }
    const deletedCollection: DatabaseCollection | null = await CollectionModel.findOneAndDelete({
      _id: collectionId,
      username,
    });
    if (!deletedCollection) {
      return { error: 'Failed to delete collection' };
    }
    return deletedCollection;
  } catch (error) {
    return { error: 'Error when deleting collection' };
  }
};

/**
 * Adds a bookmark to a collection.
 * @param {string} collectionId - The ID of the collection.
 * @param {string} bookmarkId - The ID of the bookmark to add.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<CollectionResponse>} - The updated collection or an error message.
 */
export const addBookmarkToCollection = async (
  collectionId: string,
  bookmarkId: string,
  username: string,
): Promise<CollectionResponse> => {
  try {
    // First, check if the bookmark is already in the collection
    const collection = await CollectionModel.findOne({
      _id: collectionId,
      username,
      bookmarks: bookmarkId, // This checks if bookmarkId is already in the bookmarks array
    });

    if (collection) {
      return {
        message: 'Bookmark already exists in this collection',
        isWarning: true,
        collection,
      };
    }

    // If not already in collection, add it
    const updatedCollection: DatabaseCollection | null = await CollectionModel.findOneAndUpdate(
      { _id: collectionId, username },
      { $addToSet: { bookmarks: bookmarkId } }, // Use $addToSet instead of $push to prevent duplicates
      { new: true },
    );

    if (!updatedCollection) {
      return { error: 'Collection not found or failed to add bookmark' };
    }

    return updatedCollection;
  } catch (error) {
    return { error: `Error when adding bookmark to collection: ${(error as Error).message}` };
  }
};
/**
 * Removes a bookmark from a collection.
 * @param {string} collectionId - The ID of the collection.
 * @param {string} bookmarkId - The ID of the bookmark to remove.
 * @param {string} username - The unique username of the user.
 * @returns {Promise<CollectionResponse>} - The updated collection or an error message.
 */
export const removeBookmarkFromCollection = async (
  collectionId: string,
  bookmarkId: string,
  username: string,
): Promise<CollectionResponse> => {
  try {
    const updatedCollection: DatabaseCollection | null = await CollectionModel.findOneAndUpdate(
      { _id: collectionId, username },
      { $pull: { bookmarks: bookmarkId } },
      { new: true },
    );

    if (!updatedCollection) {
      return { error: 'Collection not found or failed to remove bookmark' };
    }

    return updatedCollection;
  } catch (error) {
    console.error('Error in removeBookmarkFromCollection:', error);
    return { error: `Error when removing bookmark from collection: ${(error as Error).message}` };
  }
};

export const getBookmarksForCollection = async (
  collectionId: string,
): Promise<ObjectId[] | { error: string }> => {
  try {
    const collection = await CollectionModel.findById(collectionId);
    if (!collection) {
      return { error: 'Collection not found' };
    }
    return collection.bookmarks;
  } catch (error) {
    return { error: 'Error when fetching bookmarks in collection' };
  }
};
