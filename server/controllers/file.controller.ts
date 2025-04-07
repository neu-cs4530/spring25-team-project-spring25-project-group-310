import express, { Request, Response } from 'express';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';

/**
 * Controller for handling file-related operations.
 */
const fileController = () => {
  const router = express.Router();

  router.use((req, res, next) => {
    next();
  });

  /**
   * Serve a file by its ID from either a question or answer.
   *
   * @param req - The request containing the type, ID, and file index
   * @param res - The response object
   */
  // Update your serveFileRoute function
  const serveFileRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, id, fileIndex } = req.params;
      const fileIdx = parseInt(fileIndex, 10);

      if (Number.isNaN(fileIdx)) {
        res.status(400).json({ error: 'Invalid file index' });
        return;
      }

      // Find document using separate paths for each type
      let document;
      if (type === 'question') {
        document = await QuestionModel.findById(id);
      } else if (type === 'answer') {
        document = await AnswerModel.findById(id);
      } else {
        res.status(400).json({ error: 'Invalid type parameter' });
        return;
      }

      // Check if document exists and has files
      if (!document) {
        res.status(404).json({ error: `${type} not found` });
        return;
      }

      if (!document.files || !document.files[fileIdx]) {
        res.status(404).json({ error: 'File not found at this index' });
        return;
      }

      const file = document.files[fileIdx];
      const contentType = file.contentType || file.mimetype || 'application/octet-stream';

      if (!file.content) {
        res.status(404).json({ error: 'File content is missing' });
        return;
      }

      // Serve the file
      const binary = Buffer.from(file.content, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      res.send(binary);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({
        error: 'Failed to serve file',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  router.get('/pdf/:type/:id/:fileIndex', async (req, res) => {
    try {
      const { type, id, fileIndex } = req.params;
      const fileIdx = parseInt(fileIndex, 10);

      // Find document using separate paths for each type
      let document;
      if (type === 'question') {
        document = await QuestionModel.findById(id);
      } else if (type === 'answer') {
        document = await AnswerModel.findById(id);
      } else {
        res.status(400).json({ error: 'Invalid type parameter' });
        return;
      }

      if (!document || !document.files || !document.files[fileIdx]) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const file = document.files[fileIdx];
      const contentType = file.contentType || file.mimetype || 'application/pdf';

      if (!file.content) {
        res.status(404).json({ error: 'File content is missing' });
        return;
      }

      const binary = Buffer.from(file.content, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      res.send(binary);
    } catch (error) {
      console.error('Error serving PDF:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  router.get('/text/:type/:id/:fileIndex', async (req, res) => {
    try {
      const { type, id, fileIndex } = req.params;
      const fileIdx = parseInt(fileIndex, 10);

      // Find document using separate paths for each type
      let document;
      if (type === 'question') {
        document = await QuestionModel.findById(id);
      } else if (type === 'answer') {
        document = await AnswerModel.findById(id);
      } else {
        res.status(400).json({ error: 'Invalid type parameter' });
        return;
      }

      if (!document || !document.files || !document.files[fileIdx]) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const file = document.files[fileIdx];
      const contentType = file.contentType || file.mimetype || 'text/plain';

      if (!file.content) {
        res.status(404).json({ error: 'File content is missing' });
        return;
      }

      const binary = Buffer.from(file.content, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      res.send(binary);
    } catch (error) {
      console.error('Error serving text file:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  router.get('/other/:type/:id/:fileIndex', async (req, res) => {
    try {
      const { type, id, fileIndex } = req.params;
      const fileIdx = parseInt(fileIndex, 10);

      // Find document using separate paths for each type
      let document;
      if (type === 'question') {
        document = await QuestionModel.findById(id);
      } else if (type === 'answer') {
        document = await AnswerModel.findById(id);
      } else {
        res.status(400).json({ error: 'Invalid type parameter' });
        return;
      }

      if (!document || !document.files || !document.files[fileIdx]) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const file = document.files[fileIdx];
      const contentType = file.contentType || file.mimetype || 'text/plain';

      if (!file.content) {
        res.status(404).json({ error: 'File content is missing' });
        return;
      }

      const binary = Buffer.from(file.content, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      res.send(binary);
    } catch (error) {
      console.error('Error serving other file:', error);
      res.status(500).json({ error: String(error) });
    }
  });

  router.get('/:type/:id/:fileIndex', serveFileRoute);

  return {
    router,
  };
};

export default fileController;
