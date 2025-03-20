import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Collection collection.
 *
 * This schema defines the structure for storing bookmark collections in the database.
 * Each collection includes the following fields:
 * - `username`: The username of the user who owns this collection.
 * - `name`: A short, descriptive name for the collection.
 * - `bookmarks`: An array of ObjectIds referencing Bookmark documents that belong to this collection.
 * - `isDefault`: A boolean flag indicating whether this collection is the default "All Bookmarks" collection.
 * - `createdAt`: The date and time when the collection was created.
 */

const collectionSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bookmarks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Bookmark',
    },
  ],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default collectionSchema;
