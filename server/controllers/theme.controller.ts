import express, { Request, Response } from 'express';
import { ThemeVoteRequest } from '../types/types';
import { addVoteToTheme, getAllThemeVotes } from '../services/theme.service';
import { FakeSOSocket, ThemeVoteUpdatePayload } from '../types/types';

/**
 * Controller for theme-related endpoints.
 */
const themeVoteController = (socket?: FakeSOSocket) => {
  const router = express.Router();

  // Set up socket handler for themeVote events
  if (socket) {
    socket.on('connection', clientSocket => {
      clientSocket.on('themeVote', async data => {
        try {
          const { theme, voteType, username } = data;
          if (!theme || !voteType || !username) return;

          const status = await addVoteToTheme(
            theme,
            username,
            voteType === 'up' ? 'upvote' : 'downvote',
          );

          if (!('error' in status)) {
            socket.emit('themeVoteUpdate', {
              theme,
              upVotes: status.upVotes,
              downVotes: status.downVotes,
            });
          }
        } catch (error) {
          console.error('Error processing theme vote:', error);
        }
      });
    });
  }

  /**
   * Helper function to handle upvoting or downvoting a theme.
   */
  const voteTheme = async (
    req: ThemeVoteRequest,
    res: Response,
    type: 'upvote' | 'downvote',
  ): Promise<void> => {
    if (!req.body.themeName || !req.body.username) {
      res.status(400).send('Invalid request: themeName and username are required');
      return;
    }

    const { themeName, username } = req.body;
    try {
      const status = await addVoteToTheme(themeName, username, type);

      if (status && 'error' in status) {
        throw new Error(status.error);
      }

      // Emit socket event for real-time updates to all clients
      if (socket) {
        const payload: ThemeVoteUpdatePayload = {
          theme: themeName,
          upVotes: status.upVotes,
          downVotes: status.downVotes,
        };

        // Emit to all connected clients
        socket.emit('themeVoteUpdate', payload);
      }

      res.json(status);
    } catch (err) {
      res.status(500).send(`Error when ${type}ing theme: ${(err as Error).message}`);
    }
  };

  /**
   * Upvote a theme via HTTP endpoint.
   * @param {ThemeVoteRequest} req - The request containing the themeName and username
   * @param {Response} res - The response object
   */
  const upvoteTheme = async (req: ThemeVoteRequest, res: Response): Promise<void> => {
    await voteTheme(req, res, 'upvote');
  };

  /**
   * Downvote a theme via HTTP endpoint.
   * @param {ThemeVoteRequest} req - The request containing the themeName and username
   * @param {Response} res - The response object
   */
  const downvoteTheme = async (req: ThemeVoteRequest, res: Response): Promise<void> => {
    await voteTheme(req, res, 'downvote');
  };

  /**
   * Get all theme votes.
   * @param {Request} req - The request
   * @param {Response} res - The response object
   */
  const getThemeVotes = async (req: Request, res: Response): Promise<void> => {
    try {
      const themeVotes = await getAllThemeVotes();

      if ('error' in themeVotes) {
        throw new Error(themeVotes.error);
      }

      res.json(themeVotes);
    } catch (err) {
      res.status(500).send(`Error fetching theme votes: ${(err as Error).message}`);
    }
  };

  // Register HTTP routes
  router.post('/upvote', upvoteTheme);
  router.post('/downvote', downvoteTheme);
  router.get('/votes', getThemeVotes);

  return router;
};

export default themeVoteController;
