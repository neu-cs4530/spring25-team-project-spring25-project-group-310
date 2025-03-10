import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a user's bookmark for a Question
 * - `userId`: The ObjectId of the user who created the bookmark
 * - `questionId`: The ObjectId of the question being bookmarked.
 * - `createdAt?`: The date and time when the bookmark was created
 */
export interface Bookmark {
  userId: string;
  questionId: string;
  createdAt?: Date;
}

/**
 * Represents a bookmark stored in the database.
 * - `_id`: Unique identifier for the bookmark.
 * - `userId`: The ObjectId of the user who created the bookmark.
 * - `questionId`: The ObjectId of the question being bookmarked.
 * - `createdAt`: The date and time when the bookmark was created.
 */
export interface DatabaseBookmark extends Bookmark {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a Bookmark-related operation.
 * - Either a `DatabaseBookmark` object or an error message.
 */
export type BookmarkResponse = DatabaseBookmark | { error: string };
