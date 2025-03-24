import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import addAnswer from '../services/answerService';
import useUserContext from './useUserContext';

const allowedFileTypes = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  pdf: ['application/pdf'],
  text: ['text/plain'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface FileWithMetadata {
  file: File;
  id: string;
  preview?: string;
  type: 'image' | 'pdf' | 'text';
}

/**
 * Custom hook for managing the state and logic of an answer submission form
 * with file upload capabilities.
 */
const useAnswerForm = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [fileErr, setFileErr] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragCounter, setDragCounter] = useState<number>(0);

  const getFileType = (mimeType: string): 'image' | 'pdf' | 'text' | null => {
    if (allowedFileTypes.image.includes(mimeType)) return 'image';
    if (allowedFileTypes.pdf.includes(mimeType)) return 'pdf';
    if (allowedFileTypes.text.includes(mimeType)) return 'text';
    return null;
  };

  const processFile = (file: File): FileWithMetadata | null => {
    const fileType = getFileType(file.type);

    if (!fileType) {
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      return null;
    }

    const fileWithMetadata: FileWithMetadata = {
      file,
      id: `${Date.now()}-${file.name}`,
      type: fileType,
    };

    if (fileType === 'image') {
      fileWithMetadata.preview = URL.createObjectURL(file);
    }

    return fileWithMetadata;
  };

  /**
   * Process and add files to state
   */
  const addFiles = useCallback((selectedFiles: File[]) => {
    const newValidFiles: FileWithMetadata[] = [];
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
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setFileErr('');
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

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

  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setFiles([]);
    setFileErr('');
  }, [files]);

  const replaceFile = useCallback((id: string, newFile: File) => {
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
  }, []);

  const cleanupFilePreviewUrls = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, [files]);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    if (files.length > 10) {
      setFileErr('Cannot upload more than 10 files');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Function to post an answer to a question with attached files.
   * It validates the answer text and files, then posts the answer if valid.
   */
  const postAnswer = async () => {
    let isValid = true;
    setTextErr('');

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const formData = new FormData();
    formData.append('text', text);
    formData.append('ansBy', user.username);
    formData.append('ansDateTime', new Date().toISOString());

    files.forEach(fileObj => {
      formData.append('files', fileObj.file);
    });

    try {
      const res = await addAnswer(questionID, formData);

      if (res && res._id) {
        navigate(`/question/${questionID}`);
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      setTextErr('Failed to post answer. Please try again.');
    }
  };

  return {
    text,
    setText,
    textErr,
    files,
    fileErr,
    isDragging,
    postAnswer,
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

export default useAnswerForm;
