import React from 'react';
import useUserContext from '../../hooks/useUserContext';
import useThemeVote from '../../hooks/useThemeVote';
import './index.css';

/**
 * Interface represents the props for the ThemeVoteComponent.
 */
interface ThemeVoteComponentProps {
  themeName: string;
  themeVotes: Record<string, { upVotes: string[]; downVotes: string[] }>;
  onVoteUpdate: () => void;
}

/**
 * A modern ThemeVoteComponent that allows users to upvote or downvote a theme.
 *
 * @param themeName - The name of the theme being voted on.
 * @param themeVotes - The current votes for the theme.
 * @param onVoteUpdate - Callback function to handle vote updates.
 */
const ThemeVoteComponent = ({ themeName, themeVotes, onVoteUpdate }: ThemeVoteComponentProps) => {
  const { user, socket } = useUserContext();
  const { count, voted } = useThemeVote(themeVotes, themeName);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user || !socket) return;

    // Emit socket event for real-time update
    socket.emit('themeVote', {
      theme: themeName,
      voteType,
      username: user.username,
    });

    setTimeout(() => {
      onVoteUpdate();
    }, 500);
  };

  return (
    <div className='vote-container'>
      <button
        className={`vote-button upvote ${voted === 1 ? 'active' : ''}`}
        onClick={() => handleVote('up')}
        disabled={!user}
        aria-label='Upvote'>
        <svg
          viewBox='0 0 24 24'
          width='24'
          height='24'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <polyline points='18 15 12 9 6 15'></polyline>
        </svg>
      </button>

      <div className='vote-count'>{count}</div>

      <button
        className={`vote-button downvote ${voted === -1 ? 'active' : ''}`}
        onClick={() => handleVote('down')}
        disabled={!user}
        aria-label='Downvote'>
        <svg
          viewBox='0 0 24 24'
          width='24'
          height='24'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <polyline points='6 9 12 15 18 9'></polyline>
        </svg>
      </button>
    </div>
  );
};

export default ThemeVoteComponent;
