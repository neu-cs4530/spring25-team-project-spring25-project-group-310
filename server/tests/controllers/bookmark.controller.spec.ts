import express from 'express';
import supertest from 'supertest';
import mongoose from 'mongoose';
import bookmarkController from '../../controllers/bookmark.controller';
import { DatabaseBookmark } from '../../types/types';
import * as bookmarkService from '../../services/bookmark.service';

describe('Bookmark Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      (req as any).user = { username: 'testUser' };
      next();
    });
    app.use('/bookmark', bookmarkController()); // Note: changed from '/bookmarks' to match your actual route
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    app = null as any;
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('POST /:username', () => {
    it('should create a new bookmark successfully', async () => {
      const questionId = new mongoose.Types.ObjectId().toString();
      const bookmarkPayload = { questionId };

      const dbBookmark: DatabaseBookmark = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testUser',
        questionId,
        createdAt: new Date(),
      };

      const spy = jest.spyOn(bookmarkService, 'saveBookmark').mockResolvedValue(dbBookmark);

      const response = await supertest(app).post('/bookmark/testUser').send(bookmarkPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.username).toEqual('testUser');
      expect(response.body.questionId.toString()).toEqual(questionId);

      expect(spy).toHaveBeenCalledWith({ username: 'testUser', questionId });
    });

    it('should return 400 if questionId is missing', async () => {
      const response = await supertest(app).post('/bookmark/testUser').send({});
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request: questionId is required');
    });

    it('should return 400 if questionId is invalid', async () => {
      const response = await supertest(app)
        .post('/bookmark/testUser')
        .send({ questionId: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid questionId format');
    });

    it('should return 500 if saveBookmark service returns an error', async () => {
      const questionId = new mongoose.Types.ObjectId().toString();
      const bookmarkPayload = { questionId };

      const spy = jest
        .spyOn(bookmarkService, 'saveBookmark')
        .mockResolvedValue({ error: 'Error when saving a bookmark' });

      const response = await supertest(app).post('/bookmark/testUser').send(bookmarkPayload);
      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when creating bookmark: Error when saving a bookmark');
    });
  });

  describe('GET /:username', () => {
    it('should retrieve all bookmarks for the authenticated user', async () => {
      const dbBookmarks: DatabaseBookmark[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          username: 'testUser',
          questionId: new mongoose.Types.ObjectId().toString(),
          createdAt: new Date(),
        },
      ];

      const spy = jest.spyOn(bookmarkService, 'getBookmarksForUser').mockResolvedValue(dbBookmarks);

      const response = await supertest(app).get('/bookmark/testUser');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].username).toEqual('testUser');

      expect(spy).toHaveBeenCalledWith('testUser');
    });

    it('should return 500 if getBookmarksForUser service returns an error', async () => {
      const spy = jest
        .spyOn(bookmarkService, 'getBookmarksForUser')
        .mockResolvedValue({ error: 'Error when fetching bookmarks' });

      const response = await supertest(app).get('/bookmark/testUser');
      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching bookmarks');
    });
  });

  describe('DELETE /:username/:questionId', () => {
    it('should delete a bookmark and return the deleted bookmark', async () => {
      const questionId = new mongoose.Types.ObjectId().toString();
      const dbBookmark: DatabaseBookmark = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testUser',
        questionId,
        createdAt: new Date(),
      };

      const spy = jest.spyOn(bookmarkService, 'deleteBookmark').mockResolvedValue(dbBookmark);

      const response = await supertest(app).delete(`/bookmark/testUser/${questionId}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Bookmark deleted');
      expect(response.body.bookmark.username).toEqual('testUser');
    });

    it('should return 400 for an invalid questionId format', async () => {
      const response = await supertest(app).delete('/bookmark/testUser/invalidId');
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid questionId format');
    });
  });
});
