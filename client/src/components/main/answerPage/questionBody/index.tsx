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
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
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

  /**
   * Get the file URL for viewing/downloading
   */
  const getFileUrl = (fileIndex: number) => {
    if (!questionId) return '';
    return `${process.env.REACT_APP_SERVER_URL}/files/question/${questionId}/${fileIndex}`;
  };

  /**
   * Render file attachment based on its content type
   */
  const renderFileAttachment = (file: FileMetaData, index: number) => {
    const fileUrl = getFileUrl(index);
    const contentType = file.contentType || file.mimetype;

    // For image files, show an image preview with optimized loading
    if (contentType?.startsWith('image/')) {
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

      return (
        <div key={file.fileId || index} className='attachment-item'>
          <img
            src={fileUrl}
            alt={file.filename}
            className='attachment-image'
            onError={e => {
              console.error('Image failed to load:', fileUrl);
              // Replace the broken image with a fallback element
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
      const pdfUrl = `${process.env.REACT_APP_SERVER_URL}/files/pdf/question/${questionId}/${index}`;

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
        try {
          const textContent = atob(file.content); // Decode base64 to text
          return (
            <div key={file.fileId} className='attachment-item'>
              <div className='text-file-preview'>
                <div className='text-file-header'>
                  <a
                    href={`${process.env.REACT_APP_SERVER_URL}/files/text/question/${questionId}/${index}`}
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
        } catch (e) {
          // Fallback to link if we can't decode the content
          const textUrl = `${process.env.REACT_APP_SERVER_URL}/files/text/question/${questionId}/${index}`;
        }
      }
      const textUrl = `${process.env.REACT_APP_SERVER_URL}/files/text/question/${questionId}/${index}`;
    }

    // Default for other file types
    return (
      <div key={file.fileId} className='attachment-item'>
        <a
          href={`${process.env.REACT_APP_SERVER_URL}/files/other/question/${questionId}/${index}`}
          target='_blank'
          rel='noreferrer'
          className='file-link'>
          <span className='attachment-filename'>{file.filename}</span>
        </a>
      </div>
    );
  };

  return (
    <div id='questionBody' className='questionBody right_padding'>
      <div className='answer_question_text'>{handleHyperlink(text)}</div>
      {codeSnippet && (
        <div className='question_codeCompiler'>
          <h4>Code Snippet</h4>
          <CodeCompiler code={code} onCodeChange={setCode} readOnly={true} />
        </div>
      )}

      {files && files.length > 0 && (
        <div className='question-files'>
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

      <div className='answer_question_right'>
        <div className='question_author'>{askby}</div>
        <div className='answer_question_meta'>asked {meta}</div>
      </div>
      <div className='bold_title answer_question_view'>{views} views</div>
    </div>
  );
};

export default QuestionBody;
