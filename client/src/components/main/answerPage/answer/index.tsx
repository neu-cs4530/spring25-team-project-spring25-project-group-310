import { useState } from 'react';
import { handleHyperlink } from '../../../../tool';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseComment, FileMetaData } from '../../../../types/types';
import CodeCompiler from '../../codeCompiler';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  codeSnippet?: string;
  files?: FileMetaData[];
  answerId?: string;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */
const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  codeSnippet,
  files,
  answerId,
  handleAddComment,
}: AnswerProps) => {
  const [code, setCode] = useState<string>(codeSnippet || '');

  /**
   * Get the file URL for viewing/downloading
   */
  const getFileUrl = (fileIndex: number) => {
    if (!answerId) return '';
    return `${process.env.REACT_APP_SERVER_URL}/files/answer/${answerId}/${fileIndex}`;
  };
  /**
   * Render file attachment based on its content type
   */
  const renderFileAttachment = (file: FileMetaData, index: number) => {
    const fileUrl = getFileUrl(index);
    const contentType = file.contentType || file.mimetype;

    // For image files, show an image preview with optimized loading
    if (contentType?.startsWith('image/')) {
      // If the file has content property directly available, use it
      if (file.content) {
        return (
          <div key={file.fileId || index} className='attachment-item'>
            <img
              src={`data:${contentType};base64,${file.content}`}
              alt={file.filename}
              className='attachment-image'
            />
          </div>
        );
      }

      // Otherwise try to load from server
      return (
        <div key={file.fileId || index} className='attachment-item'>
          <img
            src={fileUrl}
            alt={file.filename}
            className='attachment-image'
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.innerText = `Image: ${file.filename} (Failed to load)`;
              fallback.className = 'image-fallback';
              target.parentNode?.appendChild(fallback);
            }}
          />
          <span className='attachment-filename'>{file.filename}</span>
        </div>
      );
    }

    // For PDFs, show a PDF icon with filename
    if (contentType === 'application/pdf') {
      // Use the specialized PDF route with the correct parameters
      // Inside renderFileAttachment
      const pdfUrl = `${process.env.REACT_APP_SERVER_URL}/files/pdf/answer/${answerId}/${index}`;

      return (
        <div key={file.fileId} className='attachment-item'>
          <a href={pdfUrl} target='_blank' rel='noreferrer' className='file-link' onClick={e => {}}>
            <div className='pdf-icon'></div>
            <span className='attachment-filename'>{file.filename}</span>
          </a>
        </div>
      );
    }

    // For text files
    if (contentType === 'text/plain') {
      // If we have the content directly available, show it inline
      if (file.content) {
        return (
          <div key={file.fileId} className='attachment-item'>
            <div className='text-file-preview'>
              <div className='text-file-header'>
                <a
                  href={`${process.env.REACT_APP_SERVER_URL}/files/text/answer/${answerId}/${index}`}
                  target='_blank'
                  rel='noreferrer'
                  className='file-link'>
                  <div className='text-icon'></div>
                  <span className='attachment-filename'>{file.filename}</span>
                </a>
              </div>
            </div>
          </div>
        );
      }
    }

    // Default for other file types
    return (
      <div key={file.fileId} className='attachment-item'>
        <a
          href={`${process.env.REACT_APP_SERVER_URL}/files/other/answer/${answerId}/${index}`}
          target='_blank'
          rel='noreferrer'
          className='file-link'>
          <span className='attachment-filename'>{file.filename}</span>
        </a>
      </div>
    );
  };

  return (
    <div className='answer right_padding'>
      <div id='answerText' className='answerText'>
        {handleHyperlink(text)}
      </div>
      {codeSnippet && (
        <div className='question_codeCompiler'>
          <h4>Code Snippet</h4>
          <CodeCompiler code={code} onCodeChange={setCode} readOnly={true} />
        </div>
      )}
      {files && files.length > 0 && (
        <div className='answer-files'>
          <h4>Attachments</h4>
          <div className='file-attachments'>
            {files.map((file, index) => (
              <div key={file.fileId || index} className='attachment-item'>
                {renderFileAttachment(file, index)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className='answerAuthor'>
        <div className='answer_author'>{ansBy}</div>
        <div className='answer_question_meta'>{meta}</div>
      </div>
      <CommentSection comments={comments} handleAddComment={handleAddComment} />
    </div>
  );
};

export default AnswerView;
