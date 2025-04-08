import mongoose from 'mongoose';
import ThemeVoteModel from '../../models/theme.model';
import { addVoteToTheme, getAllThemeVotes } from '../../services/theme.service';
import { DatabaseThemeVote } from '../../types/types';

// Mock the ThemeVoteModel
jest.mock('../../models/theme.model');
const MockedThemeVoteModel = ThemeVoteModel as jest.Mocked<typeof ThemeVoteModel>;

// Helper type for mocking
type MockDatabaseThemeVote = Partial<DatabaseThemeVote>;

describe('Theme Vote Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('addVoteToTheme', () => {
    it('should upvote a theme successfully', async () => {
      // Mock existing theme
      const existingTheme: MockDatabaseThemeVote = {
        name: 'dark',
        upVotes: [],
        downVotes: [],
      };
      MockedThemeVoteModel.findOne.mockResolvedValue(existingTheme as DatabaseThemeVote);

      // Mock findOneAndUpdate for upvote
      const updatedTheme: MockDatabaseThemeVote = {
        name: 'dark',
        upVotes: ['user1'],
        downVotes: [],
      };
      MockedThemeVoteModel.findOneAndUpdate.mockResolvedValue(updatedTheme as DatabaseThemeVote);

      const result = await addVoteToTheme('dark', 'user1', 'upvote');

      expect(result).toEqual({
        msg: 'Theme upvoted successfully',
        theme: 'dark',
        upVotes: ['user1'],
        downVotes: [],
      });
    });

    it('should cancel upvote if user has already upvoted', async () => {
      // Mock existing theme with user already upvoted
      const existingTheme: MockDatabaseThemeVote = {
        name: 'deep',
        upVotes: ['user1'],
        downVotes: [],
      };
      MockedThemeVoteModel.findOne.mockResolvedValue(existingTheme as DatabaseThemeVote);

      // Mock findOneAndUpdate for cancelling upvote
      const updatedTheme: MockDatabaseThemeVote = {
        name: 'deep',
        upVotes: [],
        downVotes: [],
      };
      MockedThemeVoteModel.findOneAndUpdate.mockResolvedValue(updatedTheme as DatabaseThemeVote);

      const result = await addVoteToTheme('deep', 'user1', 'upvote');

      expect(result).toEqual({
        msg: 'Upvote cancelled successfully',
        theme: 'deep',
        upVotes: [],
        downVotes: [],
      });
    });

    it('should handle database error', async () => {
      // Mock findOne to throw an error
      MockedThemeVoteModel.findOne.mockRejectedValue(new Error('Database error'));

      const result = await addVoteToTheme('funk', 'user1', 'upvote');

      expect(result).toEqual({
        error: 'Error when adding upvote to theme',
      });
    });
  });

  describe('getAllThemeVotes', () => {
    it('should fetch all theme votes successfully', async () => {
      // Mock theme votes
      const mockThemeVotes: MockDatabaseThemeVote[] = [
        {
          name: 'light',
          upVotes: ['user1'],
          downVotes: ['user2'],
        },
        {
          name: 'dark',
          upVotes: ['user3'],
          downVotes: [],
        },
      ];
      MockedThemeVoteModel.find.mockResolvedValue(mockThemeVotes as DatabaseThemeVote[]);

      const result = await getAllThemeVotes();

      expect(result).toEqual([
        {
          msg: 'Theme votes fetched successfully',
          theme: 'light',
          upVotes: ['user1'],
          downVotes: ['user2'],
        },
        {
          msg: 'Theme votes fetched successfully',
          theme: 'dark',
          upVotes: ['user3'],
          downVotes: [],
        },
      ]);
    });

    it('should handle error when fetching theme votes', async () => {
      // Mock find to throw an error
      MockedThemeVoteModel.find.mockRejectedValue(new Error('Database error'));

      const result = await getAllThemeVotes();

      expect(result).toEqual({
        error: 'Error fetching theme votes',
      });
    });
  });
});
