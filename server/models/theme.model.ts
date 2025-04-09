import mongoose, { Model } from 'mongoose';
import themeVoteSchema from './schema/theme.schema';
import { DatabaseThemeVote } from '../types/types';

/**
 * Mongoose model for the `Theme` collection.
 *
 * This model is created using the `Theme` interface and the `themeVoteSchema`, representing the
 * `Theme` collection in the MongoDB database, and provides an interface for interacting with
 * the themes.
 *
 * @type {Model<DatabaseThemeVote>}
 */
const ThemeVoteModel: Model<DatabaseThemeVote> = mongoose.model<DatabaseThemeVote>(
  'Theme',
  themeVoteSchema,
);

export default ThemeVoteModel;
