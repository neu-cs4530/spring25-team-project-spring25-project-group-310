import { Request } from 'express';
import { ObjectId } from 'mongodb';

/**
 * Represents a theme with voting information.
 * - `name`: The name of the theme.
 * - `upVotes`: An array of usernames who have upvoted the theme.
 * - `downVotes`: An array of usernames who have downvoted the theme.
 */
export interface ThemeVote {
  name: string;
  upVotes: string[];
  downVotes: string[];
}

/**
 * Represents a theme vote stored in the database.
 * - `_id`: Unique identifier for the theme vote.
 */
export interface DatabaseThemeVote extends ThemeVote {
  _id: ObjectId;
}

/**
 * Type representing vote response for a theme.
 * - Contains success message and updated votes arrays.
 */
export interface ThemeVoteInterface {
  msg: string;
  theme: string;
  upVotes: string[];
  downVotes: string[];
}

/**
 * Type representing possible responses for a theme vote operation.
 * - Either a vote response or an error message.
 */
export type ThemeVoteResponse = ThemeVoteInterface | { error: string };

/**
 * Interface for the request body when voting on a theme.
 * - `themeName`: The name of the theme being voted on.
 * - `username`: The username of the user casting the vote.
 */
export interface ThemeVoteRequest extends Request {
  body: {
    themeName: string;
    username: string;
  };
}