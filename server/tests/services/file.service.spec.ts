import { FileService } from '../../services/file.service';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';
import { FileMetaData } from '../../types/types';

jest.mock('../../models/questions.model');
jest.mock('../../models/answers.model');

jest.mock('mongodb', () => {
  const originalModule = jest.requireActual('mongodb');
  return {
    ...originalModule,
    ObjectId: jest.fn().mockImplementation(() => ({
      toString: () => 'mocked-file-id',
    })),
  };
});

describe('FileService', () => {
  let fileService: FileService;

  const createMockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 12345,
      buffer: Buffer.from('test content'),
      ...overrides,
    }) as Express.Multer.File;

  const createMockFileMetaData = (overrides: Partial<FileMetaData> = {}): FileMetaData => ({
    fileId: 'file-123',
    filename: 'test.pdf',
    contentType: 'application/pdf',
    size: 12345,
    content: 'base64content',
    ...overrides,
  });

  beforeAll(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    fileService = new FileService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('processUploadedFiles', () => {
    it('should return an empty array when no files are provided', () => {
      // Test with undefined
      let result = fileService.processUploadedFiles(undefined);
      expect(result).toEqual([]);

      // Test with empty array
      result = fileService.processUploadedFiles([]);
      expect(result).toEqual([]);
    });

    it('should correctly process multiple files', () => {
      const mockFiles = [
        createMockFile({
          originalname: 'test1.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('test content 1'),
        }),
        createMockFile({
          originalname: 'test2.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test content 2'),
        }),
      ];

      const result = fileService.processUploadedFiles(mockFiles);

      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('test1.pdf');
      expect(result[0].contentType).toBe('application/pdf');
      expect(result[1].filename).toBe('test2.jpg');
      expect(result[1].contentType).toBe('image/jpeg');
    });

    it('should handle files with empty buffers', () => {
      const mockFile = createMockFile({
        originalname: 'empty.txt',
        mimetype: 'text/plain',
        size: 0,
        buffer: Buffer.from(''),
      });

      const result = fileService.processUploadedFiles([mockFile]);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('');
    });
  });

  describe('getFile', () => {
    it('should retrieve a file from a question', async () => {
      const mockFile = createMockFileMetaData();

      // Setup mock for QuestionModel
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockFile],
      });

      const result = await fileService.getFile('question', '123', 0);

      expect(QuestionModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockFile);
    });

    it('should retrieve a file from an answer', async () => {
      const mockFile = createMockFileMetaData();

      // Setup mock for AnswerModel
      (AnswerModel.findById as jest.Mock).mockResolvedValue({
        files: [mockFile],
      });

      const result = await fileService.getFile('answer', '456', 0);

      expect(AnswerModel.findById).toHaveBeenCalledWith('456');
      expect(result).toEqual(mockFile);
    });

    it('should return null if question not found', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await fileService.getFile('question', '999', 0);

      expect(result).toBeNull();
    });

    it('should return null if answer not found', async () => {
      (AnswerModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await fileService.getFile('answer', '999', 0);

      expect(result).toBeNull();
    });

    it('should return null if question has no files', async () => {
      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [],
      });

      const result = await fileService.getFile('question', '123', 0);

      expect(result).toBeNull();
    });

    it('should return null if answer has no files', async () => {
      (AnswerModel.findById as jest.Mock).mockResolvedValue({
        files: [],
      });

      const result = await fileService.getFile('answer', '456', 0);

      expect(result).toBeNull();
    });

    it('should return null if file index is out of bounds', async () => {
      const mockFile = createMockFileMetaData();

      (QuestionModel.findById as jest.Mock).mockResolvedValue({
        files: [mockFile],
      });

      const result = await fileService.getFile('question', '123', 1);

      expect(result).toBeNull();
    });

    it('should return null if type is invalid', async () => {
      const result = await fileService.getFile('invalid', '123', 0);

      expect(result).toBeNull();
      expect(QuestionModel.findById).not.toHaveBeenCalled();
      expect(AnswerModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('fileToBase64 (indirectly)', () => {
    it('should correctly encode file buffer to base64', () => {
      const mockFile = createMockFile({
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('hello world'),
      });

      const result = fileService.processUploadedFiles([mockFile]);

      expect(result[0].content).toBe('aGVsbG8gd29ybGQ='); // "hello world" in base64
    });
  });
});
