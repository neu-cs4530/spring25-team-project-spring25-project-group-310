import express, { RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Question,
  FindQuestionRequest,
  FindQuestionByIdRequest,
  AddQuestionRequest,
  VoteRequest,
  FakeSOSocket,
  PopulatedDatabaseQuestion,
  FileMetaData,
} from '../types/types';
import {
  addVoteToQuestion,
  fetchAndIncrementQuestionViewsById,
  filterQuestionsByAskedBy,
  filterQuestionsBySearch,
  getQuestionsByOrder,
  saveQuestion,
} from '../services/question.service';
import { processTags } from '../services/tag.service';
import { populateDocument } from '../utils/database.util';

const questionController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Retrieves a list of questions filtered by a search term and ordered by a specified criterion.
   */
  const getQuestionsByFilter = async (req: FindQuestionRequest, res: Response): Promise<void> => {
    const { order, search, askedBy } = req.query;

    try {
      let qlist: PopulatedDatabaseQuestion[] = await getQuestionsByOrder(order);
      if (askedBy) {
        qlist = filterQuestionsByAskedBy(qlist, askedBy);
      }
      const resqlist: PopulatedDatabaseQuestion[] = filterQuestionsBySearch(qlist, search);
      res.json(resqlist);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching questions by filter: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching questions by filter`);
      }
    }
  };

  /**
   * Retrieves a question by its unique ID, and increments the view count.
   */
  const getQuestionById = async (req: FindQuestionByIdRequest, res: Response): Promise<void> => {
    const { qid } = req.params;
    const { username } = req.query;

    if (!ObjectId.isValid(qid)) {
      res.status(400).send('Invalid ID format');
      return;
    }
    if (username === undefined) {
      res.status(400).send('Invalid username requesting question.');
      return;
    }

    try {
      const q = await fetchAndIncrementQuestionViewsById(qid, username);
      if ('error' in q) {
        throw new Error('Error while fetching question by id');
      }
      socket.emit('viewsUpdate', q);
      res.json(q);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching question by id: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching question by id`);
      }
    }
  };

  /**
   * Validates a question object to ensure required fields are present.
   */
  const isQuestionBodyValid = (question: Question): boolean =>
    question.title !== undefined &&
    question.title !== '' &&
    question.text !== undefined &&
    question.text !== '' &&
    question.tags !== undefined &&
    question.tags.length > 0 &&
    question.askedBy !== undefined &&
    question.askedBy !== '' &&
    question.askDateTime !== undefined &&
    question.askDateTime !== null;

  /**
   * Validates file metadata to ensure it has all required properties.
   */
  const isFileMetadataValid = (files: FileMetaData[]): boolean =>
    files.every(file => file.filename && file.contentType && file.size && file.content);

  /**
   * Adds a new question to the database.
   * Supports file attachments as Base64 encoded strings.
   */
  const addQuestion = async (req: AddQuestionRequest, res: Response): Promise<void> => {
    // Basic question validation
    if (!isQuestionBodyValid(req.body)) {
      res.status(400).send('Invalid question body');
      return;
    }

    const question: Question = req.body;

    // If files are included, validate them
    if (question.files && question.files.length > 0) {
      if (!isFileMetadataValid(question.files)) {
        res.status(400).send('Invalid file metadata');
        return;
      }

      // Ensure each file has a fileId
      question.files = question.files.map(file => ({
        ...file,
        fileId: file.fileId || new ObjectId().toString(),
      }));
    }

    try {
      const questionsWithTags = {
        ...question,
        tags: await processTags(question.tags),
      };

      if (questionsWithTags.tags.length === 0) {
        throw new Error('Invalid tags');
      }

      const result = await saveQuestion(questionsWithTags);
      if ('error' in result) {
        throw new Error(result.error);
      }

      // Populate the question before sending the response.
      const populatedQuestion = await populateDocument(result._id.toString(), 'question');
      if ('error' in populatedQuestion) {
        throw new Error(populatedQuestion.error);
      }

      socket.emit('questionUpdate', populatedQuestion as PopulatedDatabaseQuestion);
      res.json(populatedQuestion);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when saving question: ${err.message}`);
      } else {
        res.status(500).send('Error when saving question');
      }
    }
  };

  /**
   * Helper function to handle upvoting or downvoting a question.
   */
  const voteQuestion = async (
    req: VoteRequest,
    res: Response,
    type: 'upvote' | 'downvote',
  ): Promise<void> => {
    if (!req.body.qid || !req.body.username) {
      res.status(400).send('Invalid request');
      return;
    }

    const { qid, username } = req.body;
    try {
      const status = await addVoteToQuestion(qid, username, type);
      if (status && 'error' in status) {
        throw new Error(status.error);
      }

      socket.emit('voteUpdate', { qid, upVotes: status.upVotes, downVotes: status.downVotes });
      res.json(status);
    } catch (err) {
      res.status(500).send(`Error when ${type}ing: ${(err as Error).message}`);
    }
  };

  const upvoteQuestion = async (req: VoteRequest, res: Response): Promise<void> => {
    voteQuestion(req, res, 'upvote');
  };

  const downvoteQuestion = async (req: VoteRequest, res: Response): Promise<void> => {
    voteQuestion(req, res, 'downvote');
  };

  router.get('/getQuestion', getQuestionsByFilter);
  router.get('/getQuestionById/:qid', getQuestionById);
  router.post('/addQuestion', addQuestion as RequestHandler);
  router.post('/upvoteQuestion', upvoteQuestion);
  router.post('/downvoteQuestion', downvoteQuestion);

  return router;
};

export default questionController;
