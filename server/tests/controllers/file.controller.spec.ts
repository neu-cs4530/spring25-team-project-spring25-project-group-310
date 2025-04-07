// import request from 'supertest';
// import express from 'express';
// import fileController from '../../controllers/file.controller';
// import QuestionModel from '../../models/questions.model';
// import AnswerModel from '../../models/answers.model';

// // Mock mongoose models
// jest.mock('../../models/questions.model');
// jest.mock('../../models/answers.model');

// describe('File Controller', () => {
//   let app: express.Application;

//   beforeEach(() => {
//     // Create a fresh Express app for each test
//     app = express();
//     const controller = fileController();
//     app.use('/files', controller.router);

//     // Reset all mocks before each test
//     jest.clearAllMocks();
//   });

//   describe('Middleware', () => {
//     it('should log requests', async () => {
//       const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

//       await request(app).get('/files/pdf/question/123/0');

//       expect(consoleSpy).toHaveBeenCalledWith('File route received:', 'GET', '/pdf/question/123/0');
//       consoleSpy.mockRestore();
//     });
//   });

//   describe('Image Route (General Route)', () => {
//     // This route is defined as ':type/:id/:fileIndex' in the controller
//     // and is specifically used for images

//     const mockImageFile = {
//       filename: 'test.png',
//       contentType: 'image/png',
//       content: Buffer.from('image data').toString('base64'),
//     };

//     it('should serve an image file successfully', async () => {
//       (QuestionModel.findById as jest.Mock).mockResolvedValue({
//         files: [mockImageFile],
//       });

//       // Test with the direct path
//       const response = await request(app).get('/files/question/123/0');

//       expect(response.status).toBe(200);
//       expect(response.headers['content-type']).toBe('image/png');
//       expect(response.headers['content-disposition']).toBe('inline; filename="test.png"');
//     });

//     it('should handle missing image file', async () => {
//       (QuestionModel.findById as jest.Mock).mockResolvedValue({
//         files: [],
//       });

//       const response = await request(app).get('/files/question/123/0');

//       expect(response.status).toBe(404);
//     });

//     it('should handle invalid file index for images', async () => {
//       const response = await request(app).get('/files/question/123/abc');

//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({ error: 'Invalid file index' });
//     });
//   });

//   describe('PDF Route', () => {
//     const mockPdfFile = {
//       filename: 'test.pdf',
//       contentType: 'application/pdf',
//       content: Buffer.from('pdf content').toString('base64'),
//     };

//     it('should serve a PDF file successfully', async () => {
//       (QuestionModel.findById as jest.Mock).mockResolvedValue({
//         files: [mockPdfFile],
//       });

//       const response = await request(app).get('/files/pdf/question/123/0');

//       expect(response.status).toBe(200);
//       expect(response.headers['content-type']).toBe('application/pdf');
//       expect(response.headers['content-disposition']).toBe('inline; filename="test.pdf"');
//     });

//     it('should handle missing PDF file', async () => {
//       (QuestionModel.findById as jest.Mock).mockResolvedValue({
//         files: [],
//       });

//       const response = await request(app).get('/files/pdf/question/123/0');

//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'File not found' });
//     });
//   });

//   describe('Text Route', () => {
//     const mockTextFile = {
//       filename: 'test.txt',
//       contentType: 'text/plain',
//       content: Buffer.from('text content').toString('base64'),
//     };

//     it('should serve a text file successfully', async () => {
//       (AnswerModel.findById as jest.Mock).mockResolvedValue({
//         files: [mockTextFile],
//       });

//       const response = await request(app).get('/files/text/answer/456/0');

//       expect(response.status).toBe(200);
//       expect(response.headers['content-type']).toBe('text/plain');
//       expect(response.headers['content-disposition']).toBe('inline; filename="test.txt"');
//     });

//     it('should handle missing text file content', async () => {
//       (AnswerModel.findById as jest.Mock).mockResolvedValue({
//         files: [{ filename: 'test.txt', contentType: 'text/plain' }],
//       });

//       const response = await request(app).get('/files/text/answer/456/0');

//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'File content is missing' });
//     });
//   });

//   describe('Error Handling Tests', () => {
//     it('should return 404 for invalid file index', async () => {
//       const response = await request(app).get('/files/pdf/question/123/abc');

//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'File not found' });
//     });

//     it('should return 400 for invalid type', async () => {
//       const response = await request(app).get('/files/pdf/invalid/123/0');

//       expect(response.status).toBe(400);
//       expect(response.body).toEqual({ error: 'Invalid type parameter' });
//     });

//     it('should return 404 if document not found', async () => {
//       (QuestionModel.findById as jest.Mock).mockResolvedValue(null);

//       const response = await request(app).get('/files/pdf/question/999/0');

//       expect(response.status).toBe(404);
//       expect(response.body).toEqual({ error: 'File not found' });
//     });

//     it('should handle server errors gracefully', async () => {
//       (QuestionModel.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

//       const response = await request(app).get('/files/pdf/question/123/0');

//       expect(response.status).toBe(500);
//       expect(response.body).toEqual({ error: 'Error: Database error' });
//     });
//   });

//   describe('Fallback content type', () => {
//     it('should use fallback content type when none is provided', async () => {
//       const mockFileNoContentType = {
//         filename: 'unknown.bin',
//         content: Buffer.from('binary data').toString('base64'),
//       };

//       (QuestionModel.findById as jest.Mock).mockResolvedValue({
//         files: [mockFileNoContentType],
//       });

//       const response = await request(app).get('/files/pdf/question/123/0');

//       expect(response.status).toBe(200);
//       expect(response.headers['content-type']).toBe('application/pdf');
//     });

//     it('should use mimetype when contentType is not provided', async () => {
//       const mockFileWithMimetype = {
//         filename: 'test.jpg',
//         mimetype: 'image/jpeg',
//         content: Buffer.from('image data').toString('base64'),
//       };

//       (QuestionModel.findById as jest.Mock).mockResolvedValue({
//         files: [mockFileWithMimetype],
//       });

//       const response = await request(app).get('/files/pdf/question/123/0');

//       expect(response.status).toBe(200);
//     });
//   });
// });
