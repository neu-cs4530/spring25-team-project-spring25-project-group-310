import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import BookmarkPrompt from '../bookmarkPrompt';
import { addBookmarkWithoutCollection, fetchAllBookmarks } from '../../../services/bookmarkService';
import useUserContext from '../../../hooks/useUserContext';

const AnswerPage = () => {
  const { questionID, question, handleNewComment, handleNewAnswer } = useAnswerPage();
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user: currentUser } = useUserContext();
  const { username } = currentUser;

  // Check if the question is already bookmarked when component mounts
  useEffect(() => {
    const checkIfBookmarked = async () => {
      if (!questionID || !username) return;

      // Convert questionID to string for consistent comparison
      const questionIdString = String(questionID);

      // Fetch all bookmarks for the user
      const bookmarks = await fetchAllBookmarks(username);

      // Check if this question is already in the bookmarks
      const isAlreadyBookmarked = bookmarks.some(
        bookmark => bookmark.questionId === questionIdString,
      );

      setIsBookmarked(isAlreadyBookmarked);
    };

    checkIfBookmarked();
  }, [questionID, username]);

  if (!question) {
    return <div className='loading-container'>Loading question...</div>;
  }

  const handleBookmarkClick = async () => {
    // If already bookmarked, just open the organization dialog
    if (isBookmarked) {
      setIsBookmarkModalOpen(true);
      return;
    }

    // Make sure questionID is a string
    const questionIdString = String(questionID);

    // Add bookmark to default collection
    await addBookmarkWithoutCollection(questionIdString, username);

    // Update local state
    setIsBookmarked(true);

    // Dispatch event to notify profile settings to refresh
    window.dispatchEvent(
      new CustomEvent('bookmarkAdded', {
        detail: {
          questionId: questionIdString,
          username,
          title: question.title,
        },
      }),
    );

    setIsBookmarkModalOpen(true);
  };

  const handleBookmarkClose = () => {
    setIsBookmarkModalOpen(false);
  };

  const handleBookmarkSuccess = () => {
    setIsBookmarked(true);
  };

  return (
    <div className='answer-page-container'>
      <div className='question-section'>
        {/* Question Header with Title and Actions */}
        <div className='question-header'>
          <AnswerHeader ansCount={question.answers.length} title={question.title} />

          <div className='question-actions'>
            <button
              className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkClick}
              title={isBookmarked ? 'Organize bookmark' : 'Bookmark this question'}>
              <FontAwesomeIcon icon={faBookmark} />
              <span className='bookmark-text'>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className='question-content'>
          <div className='vote-section'>
            <VoteComponent question={question} />
          </div>

          <div className='question-body-section'>
            <QuestionBody
              views={question.views.length}
              text={question.text}
              askby={question.askedBy}
              meta={getMetaData(new Date(question.askDateTime))}
              codeSnippet={question.codeSnippet}
              files={question.files}
              questionId={String(question._id)}
            />

            <CommentSection
              comments={question.comments}
              handleAddComment={(comment: Comment) =>
                handleNewComment(comment, 'question', questionID)
              }
            />
          </div>
        </div>
      </div>

      {/* Answers Section */}
      {question.answers.length > 0 && (
        <div className='answers-section'>
          <div className='section-header'>
            <h2>
              {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
          </div>

          <div className='answers-list'>
            {question.answers.map(a => (
              <AnswerView
                key={String(a._id)}
                text={a.text}
                ansBy={a.ansBy}
                meta={getMetaData(new Date(a.ansDateTime))}
                comments={a.comments}
                codeSnippet={a.codeSnippet}
                files={a.files}
                answerId={String(a._id)}
                handleAddComment={(comment: Comment) =>
                  handleNewComment(comment, 'answer', String(a._id))
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Your Answer Section */}
      <div className='your-answer-section'>
        <button
          className='answer-button'
          onClick={() => {
            handleNewAnswer();
          }}>
          <span className='icon'></span>
          Answer Question
        </button>

        <p className='answer-prompt'>
          Know the solution? Share your knowledge and help the community.
        </p>
      </div>

      {/* Bookmark Prompt Modal */}
      {isBookmarkModalOpen && (
        <BookmarkPrompt
          questionId={String(question._id)}
          onClose={handleBookmarkClose}
          onSuccess={handleBookmarkSuccess}
          username={currentUser.username}
        />
      )}
    </div>
  );
};

export default AnswerPage;
