import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import BookmarkPrompt from '../bookmarkPrompt';
import {
  addBookmarkWithoutCollection,
  fetchAllBookmarks,
  removeBookmark,
  fetchCollections,
  removeBookmarkFromCollection,
} from '../../../services/bookmarkService';
import useUserContext from '../../../hooks/useUserContext';

const AnswerPage = () => {
  const { questionID, question, handleNewComment, handleNewAnswer } = useAnswerPage();
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isNewBookmark, setIsNewBookmark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useUserContext();
  const { username } = currentUser || {};

  // Check bookmark status
  const checkBookmarkStatus = useCallback(async () => {
    if (!questionID || !username) return false;

    try {
      const questionIdString = String(questionID);
      const bookmarks = await fetchAllBookmarks(username);

      const exists =
        Array.isArray(bookmarks) &&
        bookmarks.some(bookmark => bookmark.questionId === questionIdString);

      setIsBookmarked(exists);
      return exists;
    } catch (error) {
      return false;
    }
  }, [questionID, username]);

  // Initial load of bookmark status
  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  // Listen for bookmark events
  useEffect(() => {
    const handleBookmarkEvent = () => {
      checkBookmarkStatus();
    };

    window.addEventListener('bookmarkRemoved', handleBookmarkEvent);
    window.addEventListener('bookmarkAdded', handleBookmarkEvent);

    return () => {
      window.removeEventListener('bookmarkRemoved', handleBookmarkEvent);
      window.removeEventListener('bookmarkAdded', handleBookmarkEvent);
    };
  }, [checkBookmarkStatus]);

  if (!question) {
    return <div className='loading-container'>Loading question...</div>;
  }

  // Remove bookmark from all collections
  const removeFromAllCollections = async (questionIdString: string) => {
    const collections = await fetchCollections(username);

    if (Array.isArray(collections)) {
      // For each collection containing the bookmark, remove it
      const removePromises = collections.map(async collection => {
        // Check if the collection contains the bookmark
        if (collection.bookmarks && collection.bookmarks.includes(questionIdString)) {
          await removeBookmarkFromCollection(collection._id.toString(), questionIdString, username);
        }
      });

      // Wait for all removal operations to complete
      await Promise.all(removePromises);
    }

    // Finally, remove the bookmark itself
    await removeBookmark(username, questionIdString);
  };

  // Handle bookmark button click
  const handleBookmarkClick = async () => {
    if (!username || !questionID) return;

    setIsLoading(true);

    try {
      // Refresh bookmark status to ensure accuracy
      const currentlyBookmarked = await checkBookmarkStatus();
      const questionIdString = String(questionID);

      if (!currentlyBookmarked) {
        // Add to default collection
        await addBookmarkWithoutCollection(questionIdString, username);
        setIsBookmarked(true);
        setIsNewBookmark(true);

        // Open modal with confirmation mode
        setIsBookmarkModalOpen(true);

        // Dispatch event for profile refresh
        window.dispatchEvent(
          new CustomEvent('bookmarkAdded', {
            detail: {
              questionId: questionIdString,
              username,
              title: question?.title,
            },
          }),
        );
      } else {
        // Remove from ALL collections
        await removeFromAllCollections(questionIdString);
        setIsBookmarked(false);

        // Dispatch event for profile refresh
        window.dispatchEvent(
          new CustomEvent('bookmarkRemoved', {
            detail: {
              questionId: questionIdString,
              username,
            },
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing of the bookmark modal
  const handleBookmarkClose = () => {
    setIsBookmarkModalOpen(false);
    setIsNewBookmark(false);
    checkBookmarkStatus();
  };

  // Handle success from BookmarkPrompt
  const handleBookmarkSuccess = () => {
    setIsBookmarked(true);
    setIsBookmarkModalOpen(false);
  };

  if (!question) {
    return null;
  }

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
              disabled={isLoading}
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
              handleAddComment={comment => handleNewComment(comment, 'question', questionID)}
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
                handleAddComment={comment => handleNewComment(comment, 'answer', String(a._id))}
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
          username={username}
          isNewBookmark={isNewBookmark}
        />
      )}
    </div>
  );
};

export default AnswerPage;
