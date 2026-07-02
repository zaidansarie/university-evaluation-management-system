import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useBuilder } from '../BuilderContext';
import SectionCard from './SectionCard';

function SelectedQuestionsPanel() {
  const { sections, paperQuestions, reorderQuestions } = useBuilder();

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const sourceDroppableId = result.source.droppableId;
    const destDroppableId = result.destination.droppableId;

    if (sourceDroppableId !== destDroppableId) {
      // For Phase 1, we only support reordering within the same section to keep complexity low
      alert('Moving questions between sections is currently disabled in manual mode. Please add it from the Question Bank.');
      return;
    }

    if (sourceIndex === destIndex) return;

    reorderQuestions(sourceIndex, destIndex, sourceDroppableId);
  };

  return (
    <div className="panel no-print" style={{flex: '1.2', background: '#f8fafc', overflowY: 'auto'}}>
      <div className="panel-content" style={{padding: '15px'}}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {sections.map(sec => {
            const secQs = paperQuestions.filter(pq => pq.section_client_id === sec.client_id);
            return <SectionCard key={sec.client_id} section={sec} questions={secQs} />;
          })}
        </DragDropContext>
      </div>
    </div>
  );
}

export default SelectedQuestionsPanel;
