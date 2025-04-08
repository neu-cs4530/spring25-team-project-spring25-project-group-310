import React from 'react';
import './index.css';
import QuestionHeader from './header';
import QuestionView from './question';
import useQuestionPage from '../../../hooks/useQuestionPage';

/**
 * QuestionPage component renders a modern page displaying a list of questions
 * based on filters such as order and search terms.
 * It includes a professional header with sort controls and a button to ask a new question.
 */
const QuestionPage = () => {
  const { titleText, qlist, setQuestionOrder } = useQuestionPage();

  return (
    <div className='question-page-container'>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
      />

      {qlist.length > 0 ? (
        <div className='question-list'>
          {qlist.map(q => (
            <QuestionView question={q} key={String(q._id)} />
          ))}
        </div>
      ) : (
        titleText === 'Search Results' && (
          <div className='empty-state'>
            <div className='empty-icon'>🔍</div>
            <h2>No Questions Found</h2>
            <p>Try adjusting your search criteria or browse through other categories</p>
          </div>
        )
      )}
    </div>
  );
};

export default QuestionPage;
