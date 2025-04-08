import { useState } from 'react';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * Modern CommentSection component with improved UI and interaction patterns.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 */
const CommentSection = ({ comments, handleAddComment }: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(comments.length > 0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    handleAddComment(newComment);
    setText('');
    setTextErr('');
    setShowComments(true);
    setIsExpanded(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCommentClick();
    }
  };

  return (
    <div className='comment-section'>
      <div className={`comment-header ${!showComments ? 'comments-collapsed' : ''}`}>
        <div className='comment-info-container'>
          <div className='comment-info'>
            <div className='comment-count-badge'>{comments.length}</div>
            <span className='comment-label'>{comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>

          <button
            className='toggle-comments-button'
            onClick={() => setShowComments(!showComments)}
            aria-expanded={showComments}>
            {showComments ? 'Hide Comments' : 'Show Comments'}
            <span className='toggle-icon'>▼</span>
          </button>
        </div>

        {!isExpanded && (
          <button className='add-comment-trigger' onClick={() => setIsExpanded(true)}>
            Add a comment
          </button>
        )}
      </div>

      {showComments && comments.length > 0 && (
        <div className='comments-container'>
          <div className='comments-list'>
            {comments.map(comment => (
              <div key={String(comment._id)} className='comment-item'>
                <div className='comment-author-avatar'>
                  {comment.commentBy.charAt(0).toUpperCase()}
                </div>
                <div className='comment-content'>
                  <div className='comment-header-inner'>
                    <span className='comment-author'>{comment.commentBy}</span>
                    <span className='comment-time'>
                      {getMetaData(new Date(comment.commentDateTime))}
                    </span>
                  </div>
                  <p className='comment-text'>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(isExpanded || (comments.length === 0 && showComments)) && (
        <div className='comment-composer'>
          <div className='comment-composer-avatar'>{user.username.charAt(0).toUpperCase()}</div>
          <div className='comment-input-container'>
            <textarea
              placeholder='Write a comment...'
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`comment-textarea ${textErr ? 'has-error' : ''}`}
              rows={isExpanded ? 3 : 1}
            />
            {textErr && <div className='error-message'>{textErr}</div>}

            <div className='comment-actions'>
              <button
                className='cancel-button'
                onClick={() => {
                  setIsExpanded(false);
                  setText('');
                  setTextErr('');
                }}>
                Cancel
              </button>
              <button
                className='submit-comment-button'
                onClick={handleAddCommentClick}
                disabled={text.trim() === ''}>
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
