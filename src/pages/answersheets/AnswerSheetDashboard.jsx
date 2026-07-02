import React, { useState, useEffect } from 'react';
import './AnswerSheets.css';
import AnswerSheetToolbar from './components/AnswerSheetToolbar';
import AnswerSheetSummaryCard from './components/AnswerSheetSummaryCard';
import AnswerSheetTable from './components/AnswerSheetTable';
import UploadAnswerBookletDialog from './components/UploadAnswerBookletDialog';
import LinkStudentDialog from './components/LinkStudentDialog';

function AnswerSheetDashboard() {
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [linkSheet, setLinkSheet] = useState(null); // Which sheet needs manual linking

  useEffect(() => {
    fetchAnswerSheets();
  }, []);

  const fetchAnswerSheets = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/answer-sheets');
      if (res.ok) {
        const data = await res.json();
        setAnswerSheets(data);
      }
    } catch (err) {
      console.error('Failed to fetch answer sheets', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const total = answerSheets.length;
  const assigned = answerSheets.filter(s => s.status === 'Assigned').length;
  const evaluating = answerSheets.filter(s => s.status === 'Under Evaluation').length;
  const moderation = answerSheets.filter(s => s.status === 'Moderation').length;
  const rechecking = answerSheets.filter(s => s.status === 'Rechecking').length;
  const completed = answerSheets.filter(s => s.status === 'Completed').length;
  const locked = answerSheets.filter(s => s.status === 'Locked').length;
  const pending = total - (assigned + evaluating + moderation + rechecking + completed + locked);

  return (
    <div className="answer-sheet-dashboard">
      <h1>Examination Answer Sheets</h1>
      
      <div className="as-summary-cards">
        <AnswerSheetSummaryCard title="Total Uploaded" value={total} />
        <AnswerSheetSummaryCard title="Pending Assignment" value={pending} />
        <AnswerSheetSummaryCard title="Assigned" value={assigned} />
        <AnswerSheetSummaryCard title="Under Evaluation" value={evaluating} />
        <AnswerSheetSummaryCard title="Moderation" value={moderation} />
        <AnswerSheetSummaryCard title="Rechecking" value={rechecking} />
        <AnswerSheetSummaryCard title="Completed" value={completed} />
        <AnswerSheetSummaryCard title="Locked" value={locked} />
      </div>

      <AnswerSheetToolbar onOpenUpload={() => setShowUploadModal(true)} />

      {loading ? (
        <div style={{padding: '40px', textAlign: 'center'}}>Loading data...</div>
      ) : (
        <AnswerSheetTable 
          answerSheets={answerSheets} 
          onOpenUpload={() => setShowUploadModal(true)} 
          onLinkStudent={(sheet) => setLinkSheet(sheet)}
        />
      )}

      {showUploadModal && (
        <UploadAnswerBookletDialog 
          onClose={() => setShowUploadModal(false)} 
          onUploadComplete={fetchAnswerSheets}
        />
      )}

      {linkSheet && (
        <LinkStudentDialog
          sheet={linkSheet}
          onClose={() => setLinkSheet(null)}
          onLinked={() => {
            setLinkSheet(null);
            fetchAnswerSheets();
          }}
        />
      )}
    </div>
  );
}

export default AnswerSheetDashboard;
