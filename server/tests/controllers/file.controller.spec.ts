import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import fileController from '../../controllers/file.controller';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';

// Mock mongoose models
jest.mock('../../models/questions.model');
jest.mock('../../models/answers.model');

describe('File Controller', () => {
  let app: express.Application;
  let controller: ReturnType<typeof fileController>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    controller = fileController();
    app.use('/files', controller.router);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    app = null as any;
  });

  afterAll(async () => {
    await mongoose.disconnect();

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Image Route (General Route)', () => {
    const mockImageFile = {
      filename: 'test.png',
      contentType: 'image/png',
      content: Buffer.from('image data').toString('base64'),
    };

    it('should serve an image file successfully', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockImageFile],
      });

      const response = await request(app).get('/files/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['content-disposition']).toBe('inline; filename="test.png"');
    });

    it('should handle missing image file', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [],
      });

      const response = await request(app).get('/files/question/123/0');

      expect(response.status).toBe(404);
    });

    it('should handle invalid file index for images', async () => {
      const response = await request(app).get('/files/question/123/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid file index' });
    });

    it('should handle files from answers', async () => {
      (AnswerModel.findById as jest.Mock).mockResolvedValue({
        files: [mockImageFile],
      });

      const response = await request(app).get('/files/answer/456/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.headers['content-disposition']).toBe('inline; filename="test.png"');
    });

    it('should return 404 when document not found', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/files/question/123/0');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'question not found' });
    });

    it('should return 404 when file not found at index', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockImageFile],
      });

      const response = await request(app).get('/files/question/123/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File not found at this index' });
    });
  });

  describe('PDF Route', () => {
    const mockPdfFile = {
      filename: 'test.pdf',
      contentType: 'application/pdf',
      content: Buffer.from('pdf content').toString('base64'),
    };

    it('should serve a PDF file successfully', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockPdfFile],
      });

      const response = await request(app).get('/files/pdf/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toBe('inline; filename="test.pdf"');
    });

    it('should handle missing PDF file', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [],
      });

      const response = await request(app).get('/files/pdf/question/123/0');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File not found' });
    });

    it('should handle PDF from answer', async () => {
      (AnswerModel.findById as jest.Mock).mockResolvedValue({
        files: [mockPdfFile],
      });

      const response = await request(app).get('/files/pdf/answer/456/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should return 400 for invalid type parameter', async () => {
      const response = await request(app).get('/files/pdf/invalid/123/0');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid type parameter' });
    });

    it('should handle server errors in PDF route', async () => {
      (QuestionModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/files/pdf/question/123/0');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error: Database error' });
    });
  });

  describe('Text Route', () => {
    const mockTextFile = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: Buffer.from('text content').toString('base64'),
    };

    it('should serve a text file successfully', async () => {
      (AnswerModel.findById as jest.Mock).mockResolvedValue({
        files: [mockTextFile],
      });

      const response = await request(app).get('/files/text/answer/456/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/plain');
      expect(response.headers['content-disposition']).toBe('inline; filename="test.txt"');
    });

    it('should handle missing text file content', async () => {
      (AnswerModel.findById as jest.Mock).mockResolvedValue({
        files: [{ filename: 'test.txt', contentType: 'text/plain' }],
      });

      const response = await request(app).get('/files/text/answer/456/0');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File content is missing' });
    });

    it('should handle text files from questions', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockTextFile],
      });

      const response = await request(app).get('/files/text/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/plain');
    });

    it('should handle server errors in text route', async () => {
      (AnswerModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/files/text/answer/456/0');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error: Database error' });
    });
  });

  describe('Other Route', () => {
    const mockOtherFile = {
      filename: 'data.json',
      contentType: 'application/json',
      content: Buffer.from('{"test": "data"}').toString('base64'),
    };

    it('should serve other file types successfully', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockOtherFile],
      });

      const response = await request(app).get('/files/other/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/json');
      expect(response.headers['content-disposition']).toBe('inline; filename="data.json"');
    });

    it('should handle missing content in other file types', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [{ filename: 'data.json', contentType: 'application/json' }],
      });

      const response = await request(app).get('/files/other/question/123/0');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File content is missing' });
    });

    it('should handle invalid type parameter in other route', async () => {
      const response = await request(app).get('/files/other/invalid/123/0');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid type parameter' });
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 for invalid file index', async () => {
      const response = await request(app).get('/files/pdf/question/123/abc');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File not found' });
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app).get('/files/pdf/invalid/123/0');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid type parameter' });
    });

    it('should return 404 if document not found', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/files/pdf/question/999/0');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File not found' });
    });

    it('should handle server errors gracefully', async () => {
      (QuestionModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/files/pdf/question/123/0');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error: Database error' });
    });

    it('should handle missing files array', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        // No files array property
      });

      const response = await request(app).get('/files/question/123/0');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File not found at this index' });
    });
  });

  describe('Fallback content type', () => {
    it('should use fallback content type when none is provided', async () => {
      const mockFileNoContentType = {
        filename: 'unknown.bin',
        content: Buffer.from('binary data').toString('base64'),
      };

      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockFileNoContentType],
      });

      const response = await request(app).get('/files/pdf/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should use mimetype when contentType is not provided', async () => {
      const mockFileWithMimetype = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        content: Buffer.from('image data').toString('base64'),
      };

      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockFileWithMimetype],
      });

      const response = await request(app).get('/files/pdf/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
    });

    it('should use octet-stream for general route with no content type', async () => {
      const mockFileNoType = {
        filename: 'unknown.dat',
        content: Buffer.from('unknown data').toString('base64'),
      };

      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockFileNoType],
      });

      const response = await request(app).get('/files/question/123/0');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/octet-stream');
    });
  });
});
