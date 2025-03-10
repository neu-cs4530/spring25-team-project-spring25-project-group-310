import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a collection of bookmarks.
 * - `userId`: The ObjectId of the user who owns this collection.
 * - `name`: The name of the collection (e.g., "All Bookmarks" for the default collection).
 * - `bookmarks`: An array of ObjectIds referencing the bookmarks included in this collection.
 * - `isDefault`: Indicates if this is the default "All Bookmarks" collection. Each user automatically gets an empty default collection until they bookmark an item.
 * - `createdAt?`: The date and time when the collection was created.
 */

export interface Collection {
  userId: ObjectId;
  name: string;
  bookmarks: ObjectId[];
  isDefault: boolean;
  createdAt?: Date;
}

/**
 * Represents a collection of bookmarks stored in the database.
 * - `_id`: Unique identifier for the collection.
 * - `userId`: The ObjectId of the user who owns this collection.
 * - `name`: The name of the collection (e.g., "All Bookmarks" for the default collection).
 * - `bookmarks`: An array of Bookmark ObjectIds associated with this collection.
 * - `isDefault`: A flag indicating whether this is the default "All Bookmarks" collection.
 *                Each user automatically gets an empty default collection until they bookmark an item.
 * - `createdAt`: The date and time when the collection was created.
 */
export interface DatabaseCollection extends Collection {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a Collection-related operation.
 * - Either a `DatabaseCollection` object or an error message.
 */
export type CollectionResponse = DatabaseCollection | { error: string };