/* eslint-disable import/no-extraneous-dependencies */
import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Bookmark, DatabaseBookmark, FakeSOSocket } from '../types/types';
import { saveBookmark, getBookmarksForUser, deleteBookmark } from '../services/bookmark.service';

/**
 * Controller for bookmark-related endpoints.
 * Uses the user's unique username (from req.user.username) for all operations.
 */
const bookmarkController = (socket?: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Validates that the bookmark request contains a questionId.
   * @param req The request object.
   * @returns true if valid, otherwise false.
   */
  const isBookmarkRequestValid = (req: Request): boolean => !!req.body.questionId;

  /**
   * Creates a new bookmark for a question.
   * @param req The request object.
   * @param res The response object.
   */
  const addBookmarkRoute = async (req: Request, res: Response): Promise<void> => {
    if (!isBookmarkRequestValid(req)) {
      res.status(400).send('Invalid request: questionId is required');
      return;
    }

    const { questionId } = req.body;
    if (!ObjectId.isValid(questionId)) {
      res.status(400).send('Invalid questionId format');
      return;
    }

    try {
      const { username } = req.params;
      if (!username) {
        res.status(400).send('Invalid request: Username is required');
        return;
      }
      const bookmark: Bookmark = { username, questionId };
      const result: DatabaseBookmark | { error: string } = await saveBookmark(bookmark);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.status(201).json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when creating bookmark: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves all bookmarks for the authenticated user.
   * @param req The request object.
   * @param res The response object.
   */
  const getBookmarksRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { username } = req.params;

      const result = await getBookmarksForUser(username);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when fetching bookmarks: ${(err as Error).message}`);
    }
  };

  /**
   * Deletes a bookmark for the authenticated user.
   * @param req The request object.
   * @param res The response object.
   */
  const deleteBookmarkRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, questionId } = req.params;

      if (!ObjectId.isValid(questionId)) {
        res.status(400).send('Invalid questionId format');
        return;
      }

      const result = await deleteBookmark(questionId, username);
      if ('error' in result) {
        res.status(404).json({ message: result.error });
        return;
      }

      res.json({ message: 'Bookmark deleted', bookmark: result });
    } catch (err: unknown) {
      res.status(500).send(`Error when deleting bookmark: ${(err as Error).message}`);
    }
  };

  router.post('/:username', addBookmarkRoute);
  router.get('/:username', getBookmarksRoute);
  router.delete('/:username/:questionId', deleteBookmarkRoute);

  return router;
};

export default bookmarkController;
