import { ObjectId } from 'mongodb';

/**
 * Represents a collection of bookmarks.
 * - `username`: The username of the user who owns this collection.
 * - `name`: The name of the collection (e.g., "All Bookmarks" for the default collection).
 * - `bookmarks`: An array of ObjectIds referencing the bookmarks included in this collection.
 * - `isDefault`: Indicates if this is the default "All Bookmarks" collection. Each user automatically gets an empty default collection until they bookmark an item.
 * - `createdAt?`: The date and time when the collection was created.
 * - `updatedAt?`: The date and time when the collection was updated.
 */

export interface Collection {
  username: string;
  name: string;
  bookmarks: ObjectId[];
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents a collection of bookmarks stored in the database.
 * - `_id`: Unique identifier for the collection.
 * - `username`: The username of the user who owns this collection.
 * - `name`: The name of the collection (e.g., "All Bookmarks" for the default collection).
 * - `bookmarks`: An array of Bookmark ObjectIds associated with this collection.
 * - `isDefault`: A flag indicating whether this is the default "All Bookmarks" collection.
 *                Each user automatically gets an empty default collection until they bookmark an item.
 * - `createdAt`: The date and time when the collection was created.
 *  * - `updatedAt?`: The date and time when the collection was updated.
 */
export interface DatabaseCollection extends Collection {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a Collection-related operation.
 * - Either a `DatabaseCollection` object or an error message.
 */
export type CollectionResponse = DatabaseCollection | { 
  error: string;
} | {
  message: string;
  isWarning: boolean;
  collection: DatabaseCollection;
};
