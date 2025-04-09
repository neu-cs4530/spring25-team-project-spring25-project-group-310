/* eslint-disable import/no-extraneous-dependencies */
import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Collection, FakeSOSocket } from '../types/types';
import {
  saveCollection,
  getCollectionsForUser,
  getBookmarksForCollection,
  updateCollection,
  deleteCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
} from '../services/collection.service';

/**
 * Controller for collection-related endpoints.
 * Uses the user's unique username (from req.user.username) for all operations.
 */
const collectionController = (socket?: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Validates that the create collection request contains a name.
   * @param req The request object.
   * @returns true if valid, otherwise false.
   */
  const isCreateCollectionRequestValid = (req: Request): boolean => !!req.body.name;

  /**
   * Creates a new custom collection.
   * @param req The request object.
   * @param res The response object.
   */
  const createCollectionRoute = async (req: Request, res: Response): Promise<void> => {
    if (!isCreateCollectionRequestValid(req)) {
      res.status(400).send('Invalid request: Collection name is required');
      return;
    }
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { username } = req.params;
      if (!username) {
        res.status(400).send('Invalid request: Username is required');
        return;
      }
      const { name } = req.body;

      const newCollection: Collection = {
        username,
        name,
        bookmarks: [],
        isDefault: false,
      };
      const result = await saveCollection(newCollection);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.status(201).json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when creating collection: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves all collections for the authenticated user.
   * @param req The request object.
   * @param res The response object.
   */
  // In your collection controller
  const getCollectionsRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params; // Extract username from route parameters

      const result = await getCollectionsForUser(username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when fetching collections: ${(err as Error).message}`);
    }
  };

  /**
   * Updates a collection's name.
   * @param req The request object.
   * @param res The response object.
   */
  const updateCollectionRoute = async (req: Request, res: Response): Promise<void> => {
    const { collectionId } = req.params;
    const { name } = req.body;
    if (!name) {
      res.status(400).send('Collection name is required');
      return;
    }
    if (!ObjectId.isValid(collectionId)) {
      res.status(400).send('Invalid collectionId format');
      return;
    }
    try {
      const {
        user: { username },
      } = req as any;
      const result = await updateCollection(collectionId, name, username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: 'Collection updated', collection: result });
    } catch (err: unknown) {
      res.status(500).send(`Error when updating collection: ${(err as Error).message}`);
    }
  };

  /**
   * Deletes a collection (except the default collection).
   * @param req The request object.
   * @param res The response object.
   */
  const deleteCollectionRoute = async (req: Request, res: Response): Promise<void> => {
    const { collectionId, username } = req.params;
    if (!ObjectId.isValid(collectionId)) {
      res.status(400).send('Invalid collectionId format');
      return;
    }
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const result = await deleteCollection(collectionId, username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: 'Collection deleted', collection: result });
    } catch (err: unknown) {
      res.status(500).send(`Error when deleting collection: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a bookmark to a collection.
   * @param req The request object.
   * @param res The response object.
   */
  const addBookmarkToCollectionRoute = async (req: Request, res: Response): Promise<void> => {
    const { collectionId, username } = req.params;
    const { bookmarkId } = req.body;
    if (!bookmarkId) {
      res.status(400).send('BookmarkId is required');
      return;
    }
    if (!ObjectId.isValid(collectionId) || !ObjectId.isValid(bookmarkId)) {
      res.status(400).send('Invalid collectionId or bookmarkId format');
      return;
    }
    try {
      const result = await addBookmarkToCollection(collectionId, bookmarkId, username);

      // if ('message' in result && 'isWarning' in result) {
      //   res.status(200).json({
      //     message: result.message,
      //     isWarning: true,
      //     collection: result.collection
      //   });
      //   return;
      // }

      if ('error' in result) {
        throw new Error(result.error);
      }

      res.json({ message: 'Bookmark added to collection', collection: result });
    } catch (err: unknown) {
      res.status(500).send(`Error when adding bookmark to collection: ${(err as Error).message}`);
    }
  };

  /**
   * Removes a bookmark from a collection.
   * @param req The request object.
   * @param res The response object.
   */
  const removeBookmarkFromCollectionRoute = async (req: Request, res: Response): Promise<void> => {
    const { collectionId, bookmarkId, username } = req.params; // Get username from params
    if (!ObjectId.isValid(collectionId) || !ObjectId.isValid(bookmarkId)) {
      res.status(400).send('Invalid collectionId or bookmarkId format');
      return;
    }
    try {
      const result = await removeBookmarkFromCollection(collectionId, bookmarkId, username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json({ message: 'Bookmark removed from collection', collection: result });
    } catch (err: unknown) {
      res
        .status(500)
        .send(`Error when removing bookmark from collection: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves all bookmarks for a given collection.
   * @param req The request object.
   * @param res The response object.
   * @returns void
   */
  const getBookmarksInCollection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { collectionId } = req.params;
      const result = await getBookmarksForCollection(collectionId);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when fetching bookmarks: ${(err as Error).message}`);
    }
  };

  router.post('/:username', createCollectionRoute);
  router.get('/:username', getCollectionsRoute);
  router.put('/:username/:collectionId', updateCollectionRoute);
  router.delete('/:username/:collectionId', deleteCollectionRoute);
  router.post('/:username/:collectionId/bookmarks', addBookmarkToCollectionRoute);
  router.delete(
    '/:username/:collectionId/bookmarks/:bookmarkId',
    removeBookmarkFromCollectionRoute,
  );
  router.get('/:username/:collectionId', getBookmarksInCollection);

  return router;
};

export default collectionController;
