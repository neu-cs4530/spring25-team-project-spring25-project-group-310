import { Schema } from 'mongoose';

/**
 * Mongoose schema for the ThemeVote collection.
 *
 * This schema defines the structure for storing theme votes in the database.
 * Each theme vote includes the following fields:
 * - `name`: The name of the theme.
 * - `upVotes`: An array of usernames that have upvoted the theme.
 * - `downVotes`: An array of usernames that have downvoted the theme.
 */
const themeVoteSchema: Schema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    upVotes: [{ type: String }],
    downVotes: [{ type: String }],
  },
  { collection: 'ThemeVotes' },
);

export default themeVoteSchema;
