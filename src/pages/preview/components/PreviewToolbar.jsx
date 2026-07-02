import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestionPaperPDF } from '../../../utils/pdfGenerator';

function PreviewToolbar({ paper }) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      
      // Simulate progress for UI feedback (since html2pdf is a single long blocking thread, 
      // we use setTimeout to let React render the text updates before the heavy lifting begins)
      setProgressText('Preparing document...');
      await new Promise(r => setTimeout(r, 400));
      
      setProgressText('Formatting pages...');
      await new Promise(r => setTimeout(r, 400));
      
      setProgressText('Generating PDF...');
      
      // We must wait briefly so the UI paints the 'Generating PDF...' text before html2canvas blocks the main thread
      await new Promise(r => setTimeout(r, 100));

      await generateQuestionPaperPDF('pdf-content', paper);
      
      setProgressText('Downloading...');
      await new Promise(r => setTimeout(r, 600));

    } catch (err) {
      console.error('PDF Generation Failed:', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgressText('');
    }
  };

  return (
    <div className="preview-toolbar no-print">
      <button 
        onClick={() => navigate(`/admin/question-papers/${paper.id}/build`)}
        style={{
          background: 'none', border: 'none', color: 'white', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '1rem'
        }}
        disabled={isGenerating}
      >
        ← Back to Builder
      </button>
      
      <h2>Question Paper Preview</h2>
      
      <button 
        style={{
          background: isGenerating ? '#94a3b8' : '#3b82f6', 
          color: 'white', border: 'none',
          padding: '8px 16px', borderRadius: '6px', 
          cursor: isGenerating ? 'wait' : 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
        onClick={handleDownloadPDF}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="spinner" style={{width:'16px',height:'16px',border:'2px solid white',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}></span>
            {progressText}
          </>
        ) : (
          'Download PDF'
        )}
      </button>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default PreviewToolbar;
