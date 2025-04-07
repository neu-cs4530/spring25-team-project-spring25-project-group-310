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
    return null;
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
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <VoteComponent question={question} />
        <button
          className={`bookmark_button ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmarkClick}
          style={{ marginLeft: '10px' }}
          title={isBookmarked ? 'Organize bookmark' : 'Bookmark this question'}>
          <FontAwesomeIcon icon={faBookmark} />
        </button>
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

      <AnswerHeader ansCount={question.answers.length} title={question.title} />
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
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
      />
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
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
