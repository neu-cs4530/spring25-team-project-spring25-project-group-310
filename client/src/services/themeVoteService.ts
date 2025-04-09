import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL}`;

/**
 * Interface for theme vote data
 */
export interface ThemeVoteInterface {
  theme: string;
  upVotes: string[];
  downVotes: string[];
  msg?: string;
}

/**
 * Function to upvote a theme.
 *
 * @param themeName - The name of the theme to upvote.
 * @param username - The username of the person upvoting the theme.
 * @returns Promise resolving to the updated vote data.
 * @throws Error if there is an issue upvoting the theme.
 */
export const upvoteTheme = async (
  themeName: string,
  username: string,
): Promise<ThemeVoteInterface> => {
  try {
    const response = await axios.post(`${API_URL}/themes/upvote`, { themeName, username });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to upvote theme');
    }
    throw new Error('Failed to upvote theme');
  }
};

/**
 * Function to downvote a theme.
 *
 * @param themeName - The name of the theme to downvote.
 * @param username - The username of the person downvoting the theme.
 * @returns Promise resolving to the updated vote data.
 * @throws Error if there is an issue downvoting the theme.
 */
export const downvoteTheme = async (
  themeName: string,
  username: string,
): Promise<ThemeVoteInterface> => {
  try {
    const response = await axios.post(`${API_URL}/themes/downvote`, { themeName, username });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to downvote theme');
    }
    throw new Error('Failed to downvote theme');
  }
};

/**
 * Function to get votes for all themes.
 *
 * @returns Promise resolving to an array of theme vote data.
 * @throws Error if there is an issue fetching theme votes.
 */
export const getThemeVotes = async (): Promise<ThemeVoteInterface[]> => {
  try {
    const response = await axios.get(`${API_URL}/themes/votes`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || 'Failed to fetch theme votes');
    }
    throw new Error('Failed to fetch theme votes');
  }
};
