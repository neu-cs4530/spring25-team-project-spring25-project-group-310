import { ThemeVoteResponse } from '../types/types';
import ThemeVoteModel from '../models/theme.model';
import { QueryOptions } from 'mongoose';

/**
 * Ensures that a theme has a vote record in the database.
 * If it doesn't exist, it creates one with empty vote arrays.
 *
 * @param {string} themeName - The name of the theme.
 * @returns {Promise<void>} - Resolves when the theme vote record is ensured.
 */
const ensureThemeVoteExists = async (themeName: string): Promise<void> => {
  const themeVote = await ThemeVoteModel.findOne({ name: themeName });

  if (!themeVote) {
    await ThemeVoteModel.create({
      name: themeName,
      upVotes: [],
      downVotes: [],
    });
  }
};

/**
 * Adds a vote to a theme.
 * @param {string} themeName - The theme name
 * @param {string} username - The username who voted
 * @param {'upvote' | 'downvote'} voteType - The vote type
 * @returns {Promise<ThemeVoteResponse>} - The updated vote result
 */
export const addVoteToTheme = async (
  themeName: string,
  username: string,
  voteType: 'upvote' | 'downvote',
): Promise<ThemeVoteResponse> => {
  try {
    // Ensure the theme vote record exists
    await ensureThemeVoteExists(themeName);

    let updateOperation: QueryOptions;

    if (voteType === 'upvote') {
      updateOperation = [
        {
          $set: {
            upVotes: {
              $cond: [
                { $in: [username, '$upVotes'] },
                { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
                { $concatArrays: ['$upVotes', [username]] },
              ],
            },
            downVotes: {
              $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } },
            },
          },
        },
      ];
    } else {
      updateOperation = [
        {
          $set: {
            downVotes: {
              $cond: [
                { $in: [username, '$downVotes'] },
                { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
                { $concatArrays: ['$downVotes', [username]] },
              ],
            },
            upVotes: {
              $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } },
            },
          },
        },
      ];
    }

    const result = await ThemeVoteModel.findOneAndUpdate({ name: themeName }, updateOperation, {
      new: true,
    });

    if (!result) {
      return { error: 'Theme not found!' };
    }

    let msg = '';

    if (voteType === 'upvote') {
      msg = result.upVotes.includes(username)
        ? 'Theme upvoted successfully'
        : 'Upvote cancelled successfully';
    } else {
      msg = result.downVotes.includes(username)
        ? 'Theme downvoted successfully'
        : 'Downvote cancelled successfully';
    }

    return {
      msg,
      theme: themeName,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    return {
      error:
        voteType === 'upvote'
          ? 'Error when adding upvote to theme'
          : 'Error when adding downvote to theme',
    };
  }
};

/**
 * Gets all theme votes from the database.
 * @returns {Promise<ThemeVoteResponse[]>} - Array of theme votes or error message
 */
export const getAllThemeVotes = async (): Promise<ThemeVoteResponse[] | { error: string }> => {
  try {
    const themeVotes = await ThemeVoteModel.find();

    return themeVotes.map(vote => ({
      msg: 'Theme votes fetched successfully',
      theme: vote.name,
      upVotes: vote.upVotes || [],
      downVotes: vote.downVotes || [],
    }));
  } catch (err) {
    return { error: 'Error fetching theme votes' };
  }
};
