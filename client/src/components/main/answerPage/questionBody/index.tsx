import React, { useState } from 'react';
import './index.css';
import { handleHyperlink } from '../../../../tool';
import CodeCompiler from '../../codeCompiler';
import { FileMetaData } from '../../../../types/types';

interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
  codeSnippet?: string;
  files?: FileMetaData[];
  questionId: string;
}

/**
 * QuestionBody component with improved attachment handling.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 * @param codeSnippet Optional code snippet related to the question.
 * @param files Optional file attachments.
 * @param questionId The ID of the question.
 */
const QuestionBody = ({
  views,
  text,
  askby,
  meta,
  codeSnippet,
  files,
  questionId,
}: QuestionBodyProps) => {
  const [code, setCode] = useState<string>(codeSnippet || '');
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; filename: string } | null>(
    null,
  );

  /**
   * Get the file URL for viewing/downloading
   */
  const getFileUrl = (fileIndex: number) => {
    if (!questionId) return '';
    return `${process.env.REACT_APP_SERVER_URL}/files/question/${questionId}/${fileIndex}`;
  };

  /**
   * Open image in fullscreen view
   */
  const openFullscreen = (imageUrl: string, filename: string) => {
    setFullscreenImage({ url: imageUrl, filename });
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  /**
   * Close fullscreen view
   */
  const closeFullscreen = () => {
    setFullscreenImage(null);
    // Restore body scrolling
    document.body.style.overflow = '';
  };

  /**
   * Handle file download
   */
  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Render file attachment based on its content type
   */
  const renderFileAttachment = (file: FileMetaData, index: number) => {
    const fileUrl = getFileUrl(index);
    const contentType = file.contentType || file.mimetype;

    // For image files, show thumbnail with fullscreen option
    if (contentType?.startsWith('image/')) {
      let imageSource = fileUrl;

      // If the file has content property directly available, use it
      if (file.content) {
        imageSource = `data:${contentType};base64,${file.content}`;
      }

      return (
        <div className='attachment-item'>
          <div className='image-preview' onClick={() => openFullscreen(imageSource, file.filename)}>
            <img
              src={imageSource}
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
            <div className='attachment-filename'>{file.filename}</div>
            <div className='attachment-controls'>
              <button
                className='attachment-button'
                onClick={e => {
                  e.stopPropagation();
                  openFullscreen(imageSource, file.filename);
                }}
                title='View fullscreen'>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <path d='M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7'></path>
                </svg>
              </button>
              <button
                className='attachment-button'
                onClick={e => {
                  e.stopPropagation();
                  downloadFile(imageSource, file.filename);
                }}
                title='Download'>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
                  <polyline points='7 10 12 15 17 10'></polyline>
                  <line x1='12' y1='15' x2='12' y2='3'></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For PDFs
    if (contentType === 'application/pdf') {
      const pdfUrl = `${process.env.REACT_APP_SERVER_URL}/files/pdf/question/${questionId}/${index}`;

      return (
        <div className='attachment-item'>
          <div className='file-preview pdf-preview'>
            <div className='file-icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                width='48'
                height='48'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
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
          </div>
          <div className='attachment-controls'>
            <button
              className='attachment-button'
              onClick={e => {
                e.stopPropagation();
                window.open(pdfUrl, '_blank');
              }}
              title='View'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'></path>
                <circle cx='12' cy='12' r='3'></circle>
              </svg>
            </button>
            <button
              className='attachment-button'
              onClick={e => {
                e.stopPropagation();
                downloadFile(pdfUrl, file.filename);
              }}
              title='Download'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
                <polyline points='7 10 12 15 17 10'></polyline>
                <line x1='12' y1='15' x2='12' y2='3'></line>
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // For text files
    if (contentType === 'text/plain') {
      const textUrl = `${process.env.REACT_APP_SERVER_URL}/files/text/question/${questionId}/${index}`;

      return (
        <div className='attachment-item'>
          <div className='file-preview text-preview'>
            <div className='file-icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                width='48'
                height='48'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
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
          </div>
          <div className='attachment-controls'>
            <button
              className='attachment-button'
              onClick={e => {
                e.stopPropagation();
                window.open(textUrl, '_blank');
              }}
              title='View'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'></path>
                <circle cx='12' cy='12' r='3'></circle>
              </svg>
            </button>
            <button
              className='attachment-button'
              onClick={e => {
                e.stopPropagation();
                downloadFile(textUrl, file.filename);
              }}
              title='Download'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
                <polyline points='7 10 12 15 17 10'></polyline>
                <line x1='12' y1='15' x2='12' y2='3'></line>
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // Default for other file types
    return (
      <div className='attachment-item'>
        <div className='file-preview'>
          <div className='file-icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              width='48'
              height='48'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'></path>
              <polyline points='13 2 13 9 20 9'></polyline>
            </svg>
          </div>
          <span className='attachment-filename'>{file.filename}</span>
        </div>
        <div className='attachment-controls'>
          <button
            className='attachment-button'
            onClick={e => {
              e.stopPropagation();
              downloadFile(
                `${process.env.REACT_APP_SERVER_URL}/files/other/question/${questionId}/${index}`,
                file.filename,
              );
            }}
            title='Download'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
              <polyline points='7 10 12 15 17 10'></polyline>
              <line x1='12' y1='15' x2='12' y2='3'></line>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='question-body-container'>
      <div className='question-layout'>
        <div className='question-main-content'>
          <div className='question-label'>Question</div>
          <div className='question-text'>{handleHyperlink(text)}</div>

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
              <h4>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <path d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48'></path>
                </svg>
                Attachments
              </h4>

              <div className='attachments-grid'>
                {files.map((file, index) => (
                  <div key={file.fileId || `file-${index}`}>
                    {renderFileAttachment(file, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='question-sidebar'>
          <div className='view-count'>
            <span className='count'>{views}</span> views
          </div>

          <div className='question-author-info'>
            <div className='author-avatar'>{askby.charAt(0).toUpperCase()}</div>
            <div className='author-details'>
              <div className='author-name'>{askby}</div>
              <div className='post-time'>asked {meta}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className='fullscreen-overlay' onClick={closeFullscreen}>
          <img
            src={fullscreenImage.url}
            alt={fullscreenImage.filename}
            className='fullscreen-image'
            onClick={e => e.stopPropagation()}
          />
          <button className='fullscreen-close' onClick={closeFullscreen}>
            ×
          </button>
          <button
            className='fullscreen-download'
            onClick={e => {
              e.stopPropagation();
              downloadFile(fullscreenImage.url, fullscreenImage.filename);
            }}>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
              <polyline points='7 10 12 15 17 10'></polyline>
              <line x1='12' y1='15' x2='12' y2='3'></line>
            </svg>
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionBody;
