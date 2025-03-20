import express from 'express';
import supertest from 'supertest';
import mongoose from 'mongoose';
import collectionController from '../../controllers/collection.controller';
import { DatabaseCollection } from '../../types/types';
import * as collectionService from '../../services/collection.service';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (req as any).user = { username: 'testUser' };
  next();
});
app.use('/collections', collectionController());

describe('Collection Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const collectionId = new mongoose.Types.ObjectId().toString();
  const mockDatabaseCollection: DatabaseCollection = {
    _id: new mongoose.Types.ObjectId(),
    username: 'testUser',
    name: 'Custom Collection',
    bookmarks: [],
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('POST /collections', () => {
    it('should create a new collection successfully', async () => {
      jest.spyOn(collectionService, 'saveCollection').mockResolvedValue(mockDatabaseCollection);

      const response = await supertest(app)
        .post('/collections')
        .send({ name: 'Custom Collection' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.username).toEqual('testUser');
      expect(response.body.name).toEqual('Custom Collection');
    });

    it('should return 400 if collection name is missing', async () => {
      const response = await supertest(app).post('/collections').send({});
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request: Collection name is required');
    });

    it('should return 500 if saveCollection service returns an error', async () => {
      jest
        .spyOn(collectionService, 'saveCollection')
        .mockResolvedValue({ error: 'Error when saving a collection' });
      const response = await supertest(app)
        .post('/collections')
        .send({ name: 'Custom Collection' });
      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when creating collection: Error when saving a collection',
      );
    });
  });

  describe('GET /collections', () => {
    it('should retrieve all collections for the authenticated user', async () => {
      const collectionsArray: DatabaseCollection[] = [mockDatabaseCollection];
      jest.spyOn(collectionService, 'getCollectionsForUser').mockResolvedValue(collectionsArray);

      const response = await supertest(app).get('/collections');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].username).toEqual('testUser');
    });

    it('should return 500 if getCollectionsForUser service returns an error', async () => {
      jest
        .spyOn(collectionService, 'getCollectionsForUser')
        .mockResolvedValue({ error: 'Error when fetching collections' });
      const response = await supertest(app).get('/collections');
      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching collections');
    });
  });

  describe('PUT /collections/:collectionId', () => {
    it('should update and return the collection', async () => {
      const updatedName = 'Updated Collection';
      const updatedCollection = { ...mockDatabaseCollection, name: updatedName };
      jest.spyOn(collectionService, 'updateCollection').mockResolvedValue(updatedCollection);

      const response = await supertest(app)
        .put(`/collections/${collectionId}`)
        .send({ name: updatedName });

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Collection updated');
      expect(response.body.collection.name).toEqual(updatedName);
    });

    it('should return 400 if collection name is missing', async () => {
      const response = await supertest(app).put(`/collections/${collectionId}`).send({});
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Collection name is required');
    });

    it('should return 400 if collectionId format is invalid', async () => {
      const response = await supertest(app)
        .put('/collections/invalidId')
        .send({ name: 'New Name' });
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid collectionId format');
    });

    it('should return 500 if updateCollection service returns an error', async () => {
      jest
        .spyOn(collectionService, 'updateCollection')
        .mockResolvedValue({ error: 'Collection not found' });
      const response = await supertest(app)
        .put(`/collections/${collectionId}`)
        .send({ name: 'New Name' });
      expect(response.status).toBe(500);
      expect(response.text).toContain('Collection not found');
    });
  });

  describe('DELETE /collections/:collectionId', () => {
    it('should delete and return the collection', async () => {
      jest.spyOn(collectionService, 'deleteCollection').mockResolvedValue(mockDatabaseCollection);

      const response = await supertest(app).delete(`/collections/${collectionId}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Collection deleted');
      expect(response.body.collection.username).toEqual('testUser');
    });

    it('should return 400 if collectionId format is invalid', async () => {
      const response = await supertest(app).delete('/collections/invalidId');
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid collectionId format');
    });

    it('should return 500 if deleteCollection service returns an error', async () => {
      jest
        .spyOn(collectionService, 'deleteCollection')
        .mockResolvedValue({ error: 'Collection not found' });
      const response = await supertest(app).delete(`/collections/${collectionId}`);
      expect(response.status).toBe(500);
      expect(response.text).toContain('Collection not found');
    });
  });

  describe('POST /collections/:collectionId/bookmarks', () => {
    it('should add a bookmark to the collection', async () => {
      const bookmarkId = new mongoose.Types.ObjectId().toString();
      const updatedCollection = {
        ...mockDatabaseCollection,
        bookmarks: [bookmarkId],
      } as unknown as DatabaseCollection;
      jest.spyOn(collectionService, 'addBookmarkToCollection').mockResolvedValue(updatedCollection);

      const response = await supertest(app)
        .post(`/collections/${collectionId}/bookmarks`)
        .send({ bookmarkId });

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Bookmark added to collection');
      // Map ObjectIds to strings to compare with the bookmarkId string.
      expect(response.body.collection.bookmarks.map(String)).toContain(bookmarkId);
    });

    it('should return 400 if bookmarkId is missing', async () => {
      const response = await supertest(app).post(`/collections/${collectionId}/bookmarks`).send({});
      expect(response.status).toBe(400);
      expect(response.text).toEqual('BookmarkId is required');
    });

    it('should return 400 if collectionId or bookmarkId format is invalid', async () => {
      const response = await supertest(app)
        .post('/collections/invalidId/bookmarks')
        .send({ bookmarkId: 'invalidId' });
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid collectionId or bookmarkId format');
    });

    it('should return 500 if addBookmarkToCollection service returns an error', async () => {
      const bookmarkId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(collectionService, 'addBookmarkToCollection').mockResolvedValue({
        error: 'Collection not found or failed to add bookmark',
      });
      const response = await supertest(app)
        .post(`/collections/${collectionId}/bookmarks`)
        .send({ bookmarkId });
      expect(response.status).toBe(500);
      expect(response.text).toContain('Collection not found or failed to add bookmark');
    });
  });

  describe('DELETE /collections/:collectionId/bookmarks/:bookmarkId', () => {
    it('should remove a bookmark from the collection', async () => {
      const bookmarkId = new mongoose.Types.ObjectId().toString();
      const updatedCollection = { ...mockDatabaseCollection, bookmarks: [] };
      jest
        .spyOn(collectionService, 'removeBookmarkFromCollection')
        .mockResolvedValue(updatedCollection);

      const response = await supertest(app).delete(
        `/collections/${collectionId}/bookmarks/${bookmarkId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Bookmark removed from collection');
      expect(response.body.collection.bookmarks.map(String)).not.toContain(bookmarkId);
    });

    it('should return 400 if collectionId or bookmarkId format is invalid', async () => {
      const response = await supertest(app).delete('/collections/invalidId/bookmarks/invalidId');
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid collectionId or bookmarkId format');
    });

    it('should return 500 if removeBookmarkFromCollection service returns an error', async () => {
      const bookmarkId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(collectionService, 'removeBookmarkFromCollection').mockResolvedValue({
        error: 'Collection not found or failed to remove bookmark',
      });
      const response = await supertest(app).delete(
        `/collections/${collectionId}/bookmarks/${bookmarkId}`,
      );
      expect(response.status).toBe(500);
      expect(response.text).toContain('Collection not found or failed to remove bookmark');
    });
  });
});
