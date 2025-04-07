import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addQuestion } from '../services/questionService';
import useUserContext from './useUserContext';
import { FileMetaData, UIFileMetaData, Question } from '../types/types';

// Define allowed file types and their extensions
const allowedFileTypes = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  pdf: ['application/pdf'],
  text: ['text/plain'],
};

// Maximum file size in bytes (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;
/**
 *
 * @returns title - The current value of the title input.
 * @returns text - The current value of the text input.
 * @returns tagNames - The current value of the tags input.
 * @returns codeSnippet - The current value of the code snippet input.
 * @returns titleErr - Error message for the title field, if any.
 * @returns textErr - Error message for the text field, if any.
 * @returns tagErr - Error message for the tag field, if any.
 * @returns postQuestion - Function to validate the form and submit a new question.
 * Custom hook to handle question submission and form validation with advanced file upload support
 */
const useNewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [tagNames, setTagNames] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [files, setFiles] = useState<UIFileMetaData[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [titleErr, setTitleErr] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [tagErr, setTagErr] = useState<string>('');
  const [fileErr, setFileErr] = useState<string>('');

  /**
   * Convert a file to Base64 string
   */
  // eslint-disable-next-line arrow-body-style
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Determine file type category from MIME type
   */
  const getFileType = useCallback((mimeType: string): 'image' | 'pdf' | 'text' | null => {
    if (allowedFileTypes.image.includes(mimeType)) return 'image';
    if (allowedFileTypes.pdf.includes(mimeType)) return 'pdf';
    if (allowedFileTypes.text.includes(mimeType)) return 'text';
    return null;
  }, []);

  /**
   * Create preview URLs for image files
   */
  const processFile = useCallback(
    (file: File): UIFileMetaData | null => {
      const fileType = getFileType(file.type);
      if (!fileType) {
        return null;
      }
      if (file.size > MAX_FILE_SIZE) {
        return null;
      }
      const fileWithMetadata: UIFileMetaData = {
        file,
        id: `${Date.now()}-${file.name}`,
        type: fileType,
      };
      if (fileType === 'image') {
        fileWithMetadata.preview = URL.createObjectURL(file);
      }
      return fileWithMetadata;
    },
    [getFileType],
  );

  /**
   * Process and add files to state
   */
  const addFiles = useCallback(
    (selectedFiles: File[]) => {
      const newValidFiles: UIFileMetaData[] = [];
      const invalidFiles: string[] = [];
      const oversizedFiles: string[] = [];

      selectedFiles.forEach(file => {
        const fileType = getFileType(file.type);
        if (!fileType) {
          invalidFiles.push(file.name);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          oversizedFiles.push(file.name);
          return;
        }
        const processedFile = processFile(file);
        if (processedFile) {
          newValidFiles.push(processedFile);
        }
      });

      if (invalidFiles.length > 0 || oversizedFiles.length > 0) {
        let errorMsg = '';
        if (invalidFiles.length > 0) {
          errorMsg += `Unsupported file format(s): ${invalidFiles.join(', ')}. `;
        }
        if (oversizedFiles.length > 0) {
          errorMsg += `Files exceeding 5MB limit: ${oversizedFiles.join(', ')}`;
        }
        setFileErr(errorMsg);
      }

      if (newValidFiles.length > 0) {
        setFiles(prevFiles => {
          if (prevFiles.length + newValidFiles.length > 10) {
            setFileErr(prev => `${prev ? `${prev} ` : ''}Cannot upload more than 10 files.`);
            const remainingSlots = 10 - prevFiles.length;
            return [...prevFiles, ...newValidFiles.slice(0, remainingSlots)];
          }
          return [...prevFiles, ...newValidFiles];
        });
      }
    },
    [getFileType, processFile],
  );

  /**
   * Handle file input changes.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFileErr('');
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  /**
   * Handle file drag events.
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  /**
   * Remove a file from the selection.
   */
  const removeFile = useCallback((id: string) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== id);
      const removedFile = prevFiles.find(file => file.id === id);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updatedFiles;
    });
    setFileErr('');
  }, []);

  /**
   * Clear all selected files.
   */
  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setFileErr('');
  }, [files]);

  /**
   * Replace a file with a new one.
   */
  const replaceFile = useCallback(
    (id: string, newFile: File) => {
      const processedFile = processFile(newFile);
      if (!processedFile) {
        setFileErr(
          `Unable to process file ${newFile.name}. File may be too large or an unsupported format.`,
        );
        return;
      }
      setFiles(prevFiles =>
        prevFiles.map(file => {
          if (file.id === id) {
            if (file.preview) {
              URL.revokeObjectURL(file.preview);
            }
            return processedFile;
          }
          return file;
        }),
      );
      setFileErr('');
    },
    [processFile],
  );

  /**
   * Cleanup function to release object URLs when component unmounts.
   */
  const cleanupFilePreviewUrls = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, [files]);

  /**
   * Validate the form before submitting the question.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    if (tagnames.length === 0) {
      setTagErr('Should have at least 1 tag');
      isValid = false;
    } else if (tagnames.length > 5) {
      setTagErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      setTagErr('');
    }

    for (const tagName of tagnames) {
      if (tagName.length > 20) {
        setTagErr('New tag length cannot be more than 20');
        isValid = false;
        break;
      }
    }

    if (files.length > 10) {
      setFileErr('Cannot upload more than 10 files');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Post a question with files to the server.
   */
  const postQuestion = async () => {
    if (!validateForm()) return;

    try {
      const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
      const tags = tagnames.map(tagName => ({
        name: tagName,
        description: 'user added tag',
      }));

      // Create file metadata for the backend
      const fileMetadataPromises = files.map(async fileData => {
        const base64Content = await fileToBase64(fileData.file);
        return {
          fileId: fileData.id,
          filename: fileData.file.name,
          contentType: fileData.file.type,
          size: fileData.file.size,
          content: base64Content,
        } as FileMetaData;
      });

      const fileMetadata = await Promise.all(fileMetadataPromises);

      const question: Question = {
        title,
        text,
        codeSnippet: codeSnippet || '',
        tags,
        askedBy: user.username,
        askDateTime: new Date(),
        answers: [],
        upVotes: [],
        downVotes: [],
        views: [],
        comments: [],
        files: fileMetadata.length > 0 ? fileMetadata : undefined,
      };

      const res = await addQuestion(question);

      if (res && res._id) {
        cleanupFilePreviewUrls();
        navigate('/home');
      }
    } catch (error) {
      setFileErr('Error posting question. Please try again.');
    }
  };

  return {
    title,
    setTitle,
    text,
    setText,
    codeSnippet,
    setCodeSnippet,
    tagNames,
    setTagNames,
    files,
    isDragging,
    titleErr,
    textErr,
    tagErr,
    fileErr,
    postQuestion,
    handleFileChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    removeFile,
    replaceFile,
    clearFiles,
    cleanupFilePreviewUrls,
  };
};

export default useNewQuestion;
