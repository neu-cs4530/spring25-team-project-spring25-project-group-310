import { ObjectId } from "mongodb";
import { FileMetaData } from "../types/types";
import QuestionModel from "../models/questions.model";
import AnswerModel from "../models/answers.model";

/**
 * Service class for handling file operations.
 */
export class FileService {
    /**
     * Process uploaded files and generate metadata.
     * 
     * @param files - The uploaded files from multer
     * @returns An array of FileMetaData objects
     */
    processUploadedFiles(files?: Express.Multer.File[]): FileMetaData[] {
      if (!files || files.length === 0) {
        return [];
      }
  
      return files.map(file => ({
        fileId: new ObjectId().toString(),
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        content: this.fileToBase64(file)
      }));
    }
  
    /**
     * Convert a file to Base64 string.
     * 
     * @param file - The file to convert
     * @returns Base64 encoded string
     */
    private fileToBase64(file: Express.Multer.File): string {
      return Buffer.from(file.buffer || '').toString('base64');
    }
  
    /**
     * Retrieve a file by its index from a question or answer.
     * 
     * @param type - 'question' or 'answer'
     * @param id - The ID of the question or answer
     * @param fileIndex - The index of the file
     * @returns The file metadata or null if not found
     */
    async getFile(type: string, id: string, fileIndex: number): Promise<FileMetaData | null> {
      try {
        if (type === 'question') {
          const question = await QuestionModel.findById(id);
          if (!question?.files || !question.files[fileIndex]) {
            return null;
          }
          return question.files[fileIndex];
        } else if (type === 'answer') {
          const answer = await AnswerModel.findById(id);
          if (!answer?.files || !answer.files[fileIndex]) {
            return null;
          }
          return answer.files[fileIndex];
        }
        return null;
      } catch (error) {
        console.error('Error retrieving file:', error);
        return null;
      }
    }
  }
  
  export default new FileService();