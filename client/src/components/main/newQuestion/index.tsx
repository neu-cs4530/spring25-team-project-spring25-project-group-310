import React, { useRef, useEffect } from 'react';
import useNewQuestion from '../../../hooks/useNewQuestion';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';
import CodeCompiler from '../codeCompiler';
import './index.css';

// Modern SVG icons with simpler, cleaner style
const ImageIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <rect x='3' y='3' width='18' height='18' rx='2' ry='2'></rect>
    <circle cx='8.5' cy='8.5' r='1.5'></circle>
    <polyline points='21 15 16 10 5 21'></polyline>
  </svg>
);

const PDFIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
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
);

const TextFileIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
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
);

const JavaScriptIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
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
);

/**
 * Modern NewQuestionPage component allows users to submit a new question with a title,
 * description, tags, username, and file attachments with drag & drop support.
 */
const NewQuestionPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    codeSnippet,
    setCodeSnippet,
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
  } = useNewQuestion();

  useEffect(
    () => () => {
      cleanupFilePreviewUrls();
    },
    [cleanupFilePreviewUrls],
  );

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddMoreFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReplaceFile = async (id: string) => {
    const replaceInput = document.createElement('input');
    replaceInput.type = 'file';
    replaceInput.accept = '.jpg,.jpeg,.png,.pdf,.txt';

    replaceInput.onchange = async e => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const newFile = target.files[0];
        await replaceFile(id, newFile);
      }
    };

    replaceInput.click();
  };

  const renderFilePreview = (file: (typeof files)[0]) => {
    switch (file.type) {
      case 'image':
        return (
          <div className='file-preview image-preview'>
            <img src={file.preview} alt={file.file.name} />
          </div>
        );
      case 'pdf':
        return (
          <div className='file-preview pdf-preview'>
            <PDFIcon />
            <span className='file-name'>{file.file.name}</span>
          </div>
        );
      case 'text':
        return (
          <div className='file-preview text-preview'>
            <TextFileIcon />
            <span className='file-name'>{file.file.name}</span>
          </div>
        );
      default:
        return (
          <div className='file-preview'>
            <span className='file-name'>{file.file.name}</span>
          </div>
        );
    }
  };

  return (
    <div className='new-question-container'>
      <div className='page-header'>
        <h1>Ask a Question</h1>
        <p className='page-description'>
          Get help from the Semicolon community by asking a clear, concise question
        </p>
      </div>

      <Form>
        <Input
          title={'Question Title *'}
          hint={'Limit title to 100 characters or less'}
          id={'formTitleInput'}
          val={title}
          setState={setTitle}
          err={titleErr}
        />
        <TextArea
          title={'Question Text *'}
          hint={'Add details, context, and any relevant information'}
          id={'formTextInput'}
          val={text}
          setState={setText}
          err={textErr}
        />
        <Input
          title={'Tags *'}
          hint={'Add keywords separated by whitespace (e.g., javascript react node)'}
          id={'formTagInput'}
          val={tagNames}
          setState={setTagNames}
          err={tagErr}
        />
        <div className='code-editor-section'>
          <div className='code-editor-header'>
            <label className='code-editor-label'>Code Snippet</label>
            <div className='code-language-indicator'>
              <JavaScriptIcon />
              <span>JavaScript Only</span>
            </div>
          </div>
          <CodeCompiler code={codeSnippet} onCodeChange={setCodeSnippet} />
          <div className='code-editor-hint'>
            Add a JavaScript code snippet related to your question. Code will be executable by other
            users.
          </div>
        </div>

        <div
          className={`file-upload-container ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}>
          <div className='file-upload-header'>
            <h3>Attachments</h3>
            <span className='file-upload-hint'>
              Upload images (PNG, JPG), PDFs, or text files (max 5MB per file)
            </span>
          </div>

          <input
            type='file'
            id='fileInput'
            className='file-input'
            ref={fileInputRef}
            accept='.jpg,.jpeg,.png,.pdf,.txt'
            multiple
            onChange={e => {
              handleFileChange(e);
              resetFileInput();
            }}
          />

          <div className='drag-drop-area'>
            <div className='drag-drop-content'>
              <ImageIcon />
              <p>Drag & drop files here or</p>
              <button type='button' className='file-select-btn' onClick={handleAddMoreFiles}>
                Browse Files
              </button>
            </div>
          </div>

          {fileErr && <div className='error-message'>{fileErr}</div>}

          {files.length > 0 && (
            <div className='file-preview-container'>
              <div className='file-preview-header'>
                <h4>Selected Files ({files.length}/10)</h4>
                <button type='button' className='clear-files-btn' onClick={clearFiles}>
                  Clear All
                </button>
              </div>

              <div className='file-previews'>
                {files.map(file => (
                  <div key={file.id} className='file-preview-item'>
                    {renderFilePreview(file)}
                    <div className='file-actions'>
                      <button
                        type='button'
                        className='replace-file-btn'
                        onClick={() => handleReplaceFile(file.id)}>
                        Replace
                      </button>
                      <button
                        type='button'
                        className='remove-file-btn'
                        onClick={() => removeFile(file.id)}>
                        Remove
                      </button>
                    </div>
                    <div className='file-meta'>
                      <span className='file-size'>{(file.file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='btn_indicator_container'>
          <button
            className='form_postBtn'
            onClick={() => {
              postQuestion();
            }}>
            Post Question
          </button>
          <div className='mandatory_indicator'>* indicates mandatory fields</div>
        </div>
      </Form>
    </div>
  );
};

export default NewQuestionPage;
