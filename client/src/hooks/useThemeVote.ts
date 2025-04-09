import { useState, useEffect } from 'react';
import useUserContext from './useUserContext';

/**
 * Interface for theme vote data
 */
interface ThemeVoteData {
  upVotes: string[];
  downVotes: string[];
}

/**
 * Custom hook to handle voting logic for a theme.
 * It manages the current vote count, user vote status (upvoted, downvoted),
 * and can handle real-time vote updates.
 *
 * @param themeVotes - The theme votes object containing upvotes and downvotes.
 * @param themeName - The name of the theme for which voting is tracked.
 *
 * @returns count - The current vote count (upVotes - downVotes)
 * @returns voted - The user's vote status (1 for upvote, -1 for downvote, 0 for no vote)
 */
const useThemeVote = (themeVotes: Record<string, ThemeVoteData>, themeName: string) => {
  const { user } = useUserContext();
  const [count, setCount] = useState<number>(0);
  const [voted, setVoted] = useState<number>(0);

  useEffect(() => {
    if (!themeVotes || !themeVotes[themeName]) {
      setCount(0);
      setVoted(0);
      return;
    }

    const themeVoteData = themeVotes[themeName];

    /**
     * Function to get the current vote value for the user.
     *
     * @returns The current vote value for the user for the theme, 1 for upvote, -1 for downvote, 0 for no vote.
     */
    const getVoteValue = () => {
      if (user?.username && themeVoteData.upVotes?.includes(user.username)) {
        return 1;
      }
      if (user?.username && themeVoteData.downVotes?.includes(user.username)) {
        return -1;
      }
      return 0;
    };

    // Set the initial count and vote value
    setCount((themeVoteData.upVotes?.length || 0) - (themeVoteData.downVotes?.length || 0));
    setVoted(getVoteValue());
  }, [themeVotes, themeName, user?.username]);

  return {
    count,
    voted,
  };
};

export default useThemeVote;
