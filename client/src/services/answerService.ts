import { Answer, PopulatedDatabaseAnswer } from '../types/types';
import api from './config';

const ANSWER_API_URL = `${process.env.REACT_APP_SERVER_URL}/answer`;

/**
 * Interface for the request body when adding an answer.
 */
interface AddAnswerRequestBody {
  qid: string;
  ans: Answer;
}

/**
 * Adds a new answer to a specific question with file support.
 *
 * @param qid - The ID of the question to which the answer is being added.
 * @param answerData - The answer data (includes Base64 encoded files).
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addAnswer = async (
  qid: string,
  answerData: AddAnswerRequestBody,
): Promise<PopulatedDatabaseAnswer> => {
  // Use JSON for sending answer data with Base64 encoded files
  const res = await api.post(`${ANSWER_API_URL}/addAnswer`, answerData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    throw new Error('Error while creating a new answer');
  }

  return res.data;
};

export default addAnswer;
