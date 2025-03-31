import React, { useState } from 'react';
import { handleHyperlink } from '../../../../tool';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseComment } from '../../../../types/types';
import CodeCompiler from '../../codeCompiler';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  codeSnippet?: string;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */
const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  codeSnippet,
  handleAddComment,
}: AnswerProps) => {
  const [code, setCode] = useState<string>(codeSnippet || '');

  return (
    <div className='answer right_padding'>
      <div id='answerText' className='answerText'>
        {handleHyperlink(text)}
      </div>
      {codeSnippet && (
        <div className='question_codeCompiler'>
          <h4>Code Snippet</h4>
          <CodeCompiler code={code} onCodeChange={setCode} readOnly={true} />
        </div>
      )}
      <div className='answerAuthor'>
        <div className='answer_author'>{ansBy}</div>
        <div className='answer_question_meta'>{meta}</div>
      </div>
      <CommentSection comments={comments} handleAddComment={handleAddComment} />
    </div>
  );
};

export default AnswerView;
