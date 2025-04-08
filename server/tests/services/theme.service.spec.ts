import ThemeVoteModel from '../../models/theme.model';
import { addVoteToTheme, getAllThemeVotes } from '../../services/theme.service';

// Mock the ThemeVoteModel
jest.mock('../../models/theme.model');
const MockedThemeVoteModel = ThemeVoteModel as jest.Mocked<typeof ThemeVoteModel>;

describe('Theme Vote Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('addVoteToTheme', () => {
    it('should create theme vote record if it does not exist', async () => {
      // Mock findOne to return null (theme vote record doesn't exist)
      MockedThemeVoteModel.findOne.mockResolvedValue(null);

      // Mock create method
      const mockCreatedTheme = {
        name: 'light',
        upVotes: ['user1'],
        downVotes: [],
      };
      MockedThemeVoteModel.create.mockResolvedValue(mockCreatedTheme as any);

      // Mock findOneAndUpdate
      const mockUpdatedTheme = {
        name: 'light',
        upVotes: ['user1'],
        downVotes: [],
      };
      MockedThemeVoteModel.findOneAndUpdate.mockResolvedValue(mockUpdatedTheme as any);

      const result = await addVoteToTheme('light', 'user1', 'upvote');

      expect(MockedThemeVoteModel.findOne).toHaveBeenCalledWith({ name: 'light' });
      expect(MockedThemeVoteModel.create).toHaveBeenCalledWith({
        name: 'light',
        upVotes: [],
        downVotes: [],
      });
      expect(result).toEqual({
        msg: 'Theme upvoted successfully',
        theme: 'light',
        upVotes: ['user1'],
        downVotes: [],
      });
    });

    it('should upvote a theme successfully', async () => {
      // Mock existing theme
      const existingTheme = {
        name: 'dark',
        upVotes: [],
        downVotes: [],
      };
      MockedThemeVoteModel.findOne.mockResolvedValue(existingTheme as any);

      // Mock findOneAndUpdate for upvote
      const updatedTheme = {
        name: 'dark',
        upVotes: ['user1'],
        downVotes: [],
      };
      MockedThemeVoteModel.findOneAndUpdate.mockResolvedValue(updatedTheme as any);

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
      const existingTheme = {
        name: 'deep',
        upVotes: ['user1'],
        downVotes: [],
      };
      MockedThemeVoteModel.findOne.mockResolvedValue(existingTheme as any);

      // Mock findOneAndUpdate for cancelling upvote
      const updatedTheme = {
        name: 'deep',
        upVotes: [],
        downVotes: [],
      };
      MockedThemeVoteModel.findOneAndUpdate.mockResolvedValue(updatedTheme as any);

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
      const mockThemeVotes = [
        {
          name: 'light',
          upVotes: ['user1'],
          downVotes: ['user2'],
        },
        {
          name: 'dark',
          upVotes: ['user3'],
          downVotes: [],
        }
      ];
      MockedThemeVoteModel.find.mockResolvedValue(mockThemeVotes as any);

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
        }
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
