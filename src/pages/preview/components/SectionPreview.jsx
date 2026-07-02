import React from 'react';
import InternalChoicePreview from './InternalChoicePreview';
import QuestionPreview from './QuestionPreview';

function SectionPreview({ section }) {
  const instructions = section.parsedConfig?.instructions;

  return (
    <div className="section-preview">
      <div className="section-heading">
        <div>{section.name}</div>
        <div style={{fontSize: '10pt', marginTop: '5px', fontWeight: 'normal'}}>
          ({section.total_marks} Marks)
        </div>
      </div>

      {instructions && (
        <div className="section-instructions">
          {instructions}
        </div>
      )}

      <div className="section-questions">
        {section.questionGroups.map((group, idx) => {
          if (group.type === 'single') {
            return <QuestionPreview key={group.question.id} question={group.question} />;
          } else if (group.type === 'group') {
            return <InternalChoicePreview key={`group-${idx}`} group={group.questions} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default SectionPreview;
