import React from 'react';
import './index.css';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  ansCount: number;
  title: string;
}

/**
 * Modern AnswerHeader component with question title and left-aligned answer count below.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ ansCount, title }: AnswerHeaderProps) => (
  <div className='question-title-container'>
    <h1 className='question-title'>{title}</h1>

    <div className='answer-count'>
      <span className='count'>{ansCount}</span>
      <span className='label'>{ansCount === 1 ? 'answer' : 'answers'}</span>
    </div>
  </div>
);

export default AnswerHeader;
