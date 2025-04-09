import React from 'react';
import '../index.css';
import { TagData } from '../../../../types/types';
import useTagSelected from '../../../../hooks/useTagSelected';

/**
 * Props for the Tag component.
 *
 * t - The tag object.
 * clickTag - Function to handle the tag click event.
 */
interface TagProps {
  t: TagData;
  clickTag: (tagName: string) => void;
}

/**
 * Modern Tag component that displays information about a specific tag.
 *
 * @param t - The tag object.
 * @param clickTag - Function to handle tag clicks.
 */
const TagView = ({ t, clickTag }: TagProps) => {
  const { tag } = useTagSelected(t);

  return (
    <div
      className='tag-card'
      onClick={() => {
        clickTag(t.name);
      }}>
      <div className='tag-card-header'>
        <div className='tag-name'>{tag.name}</div>
      </div>

      <div className='tag-card-body'>
        <p className='tag-description'>{tag.description || 'No description available'}</p>
      </div>

      <div className='tag-card-footer'>
        <div className='tag-question-count'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
          </svg>
          <span>
            {t.qcnt} {t.qcnt === 1 ? 'question' : 'questions'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TagView;
