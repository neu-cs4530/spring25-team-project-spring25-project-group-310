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
 * Modern AnswerView component that displays answers in a social media-like format.
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
          <div className='attachment-preview image-preview'>
            <img
              src={`data:${contentType};base64,${file.content}`}
              alt={file.filename}
              className='attachment-image'
            />
            <span className='attachment-filename'>{file.filename}</span>
          </div>
        );
      }

      // Otherwise try to load from server
      return (
        <div className='attachment-preview image-preview'>
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
      const pdfUrl = `${process.env.REACT_APP_SERVER_URL}/files/pdf/answer/${answerId}/${index}`;

      return (
        <div className='attachment-preview pdf-preview'>
          <a href={pdfUrl} target='_blank' rel='noreferrer' className='file-link'>
            <div className='pdf-icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                width='24'
                height='24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
                <polyline points='14 2 14 8 20 8'></polyline>
                <path d='M9 15h6'></path>
                <path d='M9 18h6'></path>
                <path d='M9 12h6'></path>
              </svg>
            </div>
            <span className='attachment-filename'>{file.filename}</span>
          </a>
        </div>
      );
    }

    // For text files
    if (contentType === 'text/plain') {
      return (
        <div className='attachment-preview text-preview'>
          <a
            href={`${process.env.REACT_APP_SERVER_URL}/files/text/answer/${answerId}/${index}`}
            target='_blank'
            rel='noreferrer'
            className='file-link'>
            <div className='text-icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                width='24'
                height='24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
                <polyline points='14 2 14 8 20 8'></polyline>
                <line x1='16' y1='13' x2='8' y2='13'></line>
                <line x1='16' y1='17' x2='8' y2='17'></line>
                <polyline points='10 9 9 9 8 9'></polyline>
              </svg>
            </div>
            <span className='attachment-filename'>{file.filename}</span>
          </a>
        </div>
      );
    }

    // Default for other file types
    return (
      <div className='attachment-preview'>
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
    <div className='answer-container'>
      <div className='answer-label'>Answer</div>

      <div className='answer-layout'>
        <div className='answer-content'>
          <div className='answer-text'>{handleHyperlink(text)}</div>

          {codeSnippet && (
            <div className='code-snippet-section'>
              <div className='code-snippet-header'>
                <h4>Code Snippet</h4>
                <div className='code-language-indicator'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    fill='none'
                    stroke='#323330'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <path d='M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z' />
                    <path d='M10 9v8' />
                    <path d='M14 9v8' />
                    <path d='M10 13h4' />
                    <path d='M16 9l2 8' />
                    <path d='M8 9l-2 8' />
                  </svg>
                  <span>JavaScript</span>
                </div>
              </div>
              <CodeCompiler code={code} onCodeChange={setCode} readOnly={true} />
            </div>
          )}

          {files && files.length > 0 && (
            <div className='attachments-section'>
              <h4>Attachments</h4>
              <div className='attachments-grid'>
                {files.map((file, index) => (
                  <div key={file.fileId || index} className='attachment-item'>
                    {renderFileAttachment(file, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='answer-meta'>
          <div className='answer-author-info'>
            <div className='author-avatar'>{ansBy.charAt(0).toUpperCase()}</div>
            <div className='author-details'>
              <div className='author-name'>{ansBy}</div>
              <div className='post-time'>answered {meta}</div>
            </div>
          </div>
        </div>
      </div>

      <CommentSection comments={comments} handleAddComment={handleAddComment} />
    </div>
  );
};

export default AnswerView;
