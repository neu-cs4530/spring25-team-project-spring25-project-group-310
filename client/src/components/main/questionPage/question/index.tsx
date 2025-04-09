import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseQuestion } from '../../../../types/types';

/**
 * Interface representing the props for the Question component.
 *
 * question - The question object containing details about the question.
 */
interface QuestionProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * QuestionView component renders a modern card for each question with
 * stats, title, tags, and author information.
 *
 * @param question - The question object containing question details.
 */
const QuestionView = ({ question }: QuestionProps) => {
  const navigate = useNavigate();

  /**
   * Navigate to the home page filtered by the selected tag
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);
    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Navigate to the question detail page
   */
  const handleAnswer = (questionID: ObjectId) => {
    navigate(`/question/${questionID}`);
  };

  return (
    <div
      className='question-card'
      onClick={() => {
        if (question._id) {
          handleAnswer(question._id);
        }
      }}>
      <div className='question-stats'>
        <div className='stat-item'>
          <span className='stat-value'>{question.answers.length || 0}</span>
          <span className='stat-label'>answers</span>
        </div>

        <div className='stat-item'>
          <span className='stat-value'>{question.views.length}</span>
          <span className='stat-label'>views</span>
        </div>
      </div>

      <div className='question-content'>
        <h3 className='question-title'>{question.title}</h3>

        <div className='question-tags'>
          {question.tags.map(tag => (
            <button
              key={String(tag._id)}
              className='tag'
              onClick={e => {
                e.stopPropagation();
                clickTag(tag.name);
              }}>
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className='question-meta'>
        <div className='author-info'>
          <div className='author-avatar'>{question.askedBy.charAt(0).toUpperCase()}</div>
          <div className='author-details'>
            <span className='author-name'>{question.askedBy}</span>
            <span className='post-time'>asked {getMetaData(new Date(question.askDateTime))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
