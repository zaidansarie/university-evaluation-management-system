import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useBuilder } from '../BuilderContext';
import SectionCard from './SectionCard';
import PaperSummaryCard from './PaperSummaryCard';

function SelectedQuestionsPanel() {
  const { sections, paperQuestions, reorderQuestions } = useBuilder();

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const sourceDroppableId = result.source.droppableId;
    const destDroppableId = result.destination.droppableId;

    if (sourceDroppableId !== destDroppableId) {
      alert('Moving questions between sections is currently disabled in manual mode. Please add it from the Question Bank.');
      return;
    }

    if (sourceIndex === destIndex) return;

    reorderQuestions(sourceIndex, destIndex, sourceDroppableId);
  };

  return (
    <div className="panel no-print" style={{ flex: '1.2', height: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      
      {/* Sticky Summary Header */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', zIndex: 5 }}>
        <PaperSummaryCard />
      </div>

      {/* Scrollable Canvas */}
      <div className="panel-content" style={{ padding: '20px', overflowY: 'auto', flex: 1, background: '#f1f5f9' }}>
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
