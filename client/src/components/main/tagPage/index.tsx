import React from 'react';
import './index.css';
import TagView from './tag';
import useTagPage from '../../../hooks/useTagPage';
import AskQuestionButton from '../askQuestionButton';

/**
 * TagPage component with styling that matches the QuestionHeader component.
 */
const TagPage = () => {
  const { tlist, clickTag } = useTagPage();

  return (
    <>
      <div className='question-header-container'>
        <div className='header-top-row'>
          <h1 className='header-title'>All Tags</h1>
          <AskQuestionButton />
        </div>

        <div className='header-bottom-row'>
          <div className='question-count'>
            <span className='count-number'>{tlist.length}</span> tags
          </div>

          {/* Placeholder for additional controls if needed in the future */}
          <div></div>
        </div>
      </div>

      <div className='tag-list'>
        {tlist.length > 0 ? (
          tlist.map(t => <TagView key={t.name} t={t} clickTag={clickTag} />)
        ) : (
          <div className='empty-tag-list'>
            <div className='empty-icon'>🏷️</div>
            <h3>No tags available</h3>
            <p>Tags will appear here once they have been created.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TagPage;
