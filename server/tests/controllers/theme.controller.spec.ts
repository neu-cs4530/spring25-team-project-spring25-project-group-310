import supertest from 'supertest';
import { app } from '../../app';
import * as themeVoteService from '../../services/theme.service';
import { ThemeVoteResponse } from '../../types/types';

const addVoteToThemeSpy = jest.spyOn(themeVoteService, 'addVoteToTheme');
const getAllThemeVotesSpy = jest.spyOn(themeVoteService, 'getAllThemeVotes');

describe('Theme Vote Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /themes/upvote', () => {
    it('should successfully upvote a theme', async () => {
      const mockReqBody = {
        themeName: 'light',
        username: 'test-user',
      };

      const mockResponse = {
        msg: 'Theme upvoted successfully',
        theme: 'light',
        upVotes: ['test-user'],
        downVotes: [],
      };

      addVoteToThemeSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/themes/upvote').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(addVoteToThemeSpy).toHaveBeenCalledWith('light', 'test-user', 'upvote');
    });

    it('should return 400 if themeName is missing', async () => {
      const mockReqBody = {
        username: 'test-user',
      };

      const response = await supertest(app).post('/themes/upvote').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request: themeName and username are required');
    });

    it('should return 400 if username is missing', async () => {
      const mockReqBody = {
        themeName: 'light',
      };

      const response = await supertest(app).post('/themes/upvote').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request: themeName and username are required');
    });

    it('should return 500 if addVoteToTheme throws an error', async () => {
      const mockReqBody = {
        themeName: 'light',
        username: 'test-user',
      };

      addVoteToThemeSpy.mockResolvedValueOnce({
        error: 'Voting failed',
      });

      const response = await supertest(app).post('/themes/upvote').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when upvoteing theme: Voting failed');
    });
  });

  describe('POST /themes/downvote', () => {
    it('should successfully downvote a theme', async () => {
      const mockReqBody = {
        themeName: 'dark',
        username: 'test-user',
      };

      const mockResponse = {
        msg: 'Theme downvoted successfully',
        theme: 'dark',
        upVotes: [],
        downVotes: ['test-user'],
      };

      addVoteToThemeSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/themes/downvote').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(addVoteToThemeSpy).toHaveBeenCalledWith('dark', 'test-user', 'downvote');
    });

    it('should return 400 if themeName is missing', async () => {
      const mockReqBody = {
        username: 'test-user',
      };

      const response = await supertest(app).post('/themes/downvote').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request: themeName and username are required');
    });

    it('should return 400 if username is missing', async () => {
      const mockReqBody = {
        themeName: 'dark',
      };

      const response = await supertest(app).post('/themes/downvote').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request: themeName and username are required');
    });

    it('should return 500 if addVoteToTheme throws an error', async () => {
      const mockReqBody = {
        themeName: 'dark',
        username: 'test-user',
      };

      addVoteToThemeSpy.mockResolvedValueOnce({
        error: 'Voting failed',
      });

      const response = await supertest(app).post('/themes/downvote').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when downvoteing theme: Voting failed');
    });
  });

  describe('GET /themes/votes', () => {
    it('should successfully fetch all theme votes', async () => {
      const mockThemeVotes: ThemeVoteResponse[] = [
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
      ];

      getAllThemeVotesSpy.mockResolvedValueOnce(mockThemeVotes);

      getAllThemeVotesSpy.mockResolvedValueOnce(mockThemeVotes);

      const response = await supertest(app).get('/themes/votes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockThemeVotes);
      expect(getAllThemeVotesSpy).toHaveBeenCalled();
    });
  });
});
