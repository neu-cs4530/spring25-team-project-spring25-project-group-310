import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Comment, DatabaseComment } from './comment';

/**
 * Represents an answer to a question.
 * - `text`: The answer text.
 * - `ansBy`: The author of the answer.
 * - `codeSnippet`: The code written in the compiler.
 * - `ansDateTime`: The timestamp of when the answer was given.
 * - `comments`: A list of comments associated with the answer.
 * - `files`: An array of files attached to the answer.
 */
export interface Answer {
  text: string;
  ansBy: string;
  codeSnippet?: string;
  ansDateTime: Date;
  comments: Comment[];
  files?: FileMetaData[];
}

/**
 * Represents an answer stored in the database.
 * - `_id`: The unique identifier of the answer.
 * - `comments`: A list of ObjectId references to the comments related to the answer.
 * - `files`: An array of file metadata for files attached to the answer.
 */
export interface DatabaseAnswer extends Omit<Answer, 'comments'> {
  _id: ObjectId;
  comments: ObjectId[];
  files?: FileMetaData[];
}

/**
 * Represents a fully populated answer from the database.
 * - `comments`: A list of populated `DatabaseComment` objects.
 */
export interface PopulatedDatabaseAnswer extends Omit<DatabaseAnswer, 'comments'> {
  comments: DatabaseComment[];
}

/**
 * Interface extending the request body for adding an answer to a question.
 * - `qid`: The unique identifier of the question being answered.
 * - `ans`: The answer being added.
 */
export interface AddAnswerRequest extends Request {
  body: {
    qid: string;
    ans: Answer;
  };
  files?: Express.Multer.File[];
}

/**
 * Type representing possible responses for an Answer-related operation.
 * - Either a `DatabaseAnswer` object or an error message.
 */
export type AnswerResponse = DatabaseAnswer | { error: string };
