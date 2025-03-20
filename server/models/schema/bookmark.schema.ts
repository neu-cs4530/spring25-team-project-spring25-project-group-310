import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Bookmark collection.
 *
 * This schema defines the structure for storing bookmarks in the database.
 * Each bookmark includes the following fields:
 * - `username`: The username of the user who created the bookmark.
 * - `questionId`: The ObjectId of the question being bookmarked.
 * - `createdAt`: The date and time when the bookmark was created.
 */

const bookmarkSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default bookmarkSchema;
