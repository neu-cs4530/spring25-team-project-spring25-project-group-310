import mongoose, { Model } from 'mongoose';
import bookmarkSchema from './schema/bookmark.schema';
import { DatabaseBookmark } from '../types/types';

/**
 * Mongoose model for the `Bookmark` collection.
 */
const BookmarkModel: Model<DatabaseBookmark> = mongoose.model<DatabaseBookmark>('Bookmark', bookmarkSchema);

export default BookmarkModel;