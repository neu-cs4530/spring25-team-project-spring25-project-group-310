import mongoose, { Model } from 'mongoose';
import collectionSchema from './schema/collection.schema';
import { DatabaseCollection } from '../types/types';

/**
 * Mongoose model for the `Collection` collection.
 */
const CollectionModel: Model<DatabaseCollection> = mongoose.model<DatabaseCollection>('Collection', collectionSchema);

export default CollectionModel;