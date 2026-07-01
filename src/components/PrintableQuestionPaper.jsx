import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import './PrintableQuestionPaper.css';

function PrintableQuestionPaper({ paper, sections, paperQuestions, onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('question-paper-document');
    element.style.padding = '0'; // Remove CSS padding so html2pdf can handle margins natively without double spacing

    const opt = {
      margin:       15,
      filename:     `${paper.paper_title.replace(/\s+/g, '_')}_Paper.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] } // Removed 'avoid-all' so sections can break naturally across pages
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.padding = ''; // Restore padding
      setIsGenerating(false);
    }).catch(err => {
      console.error('PDF Generation Error', err);
      element.style.padding = ''; // Restore padding
      setIsGenerating(false);
    });
  };

  return (
    <div className="print-preview-overlay">
      <div className="print-preview-toolbar no-print">
        <button className="btn-back" onClick={onBack}>← Back to Editor</button>
        <div style={{display:'flex', alignItems: 'center', gap:'15px'}}>
          <span style={{fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic'}}>
            For the cleanest PDF, disable "Headers and Footers" in your browser's Print dialog.
          </span>
          <button className="btn-back" onClick={handlePrint}>🖨️ Browser Print</button>
          <button className="btn-print" onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? '⏳ Generating...' : '⬇️ Download PDF'}
          </button>
        </div>
      </div>

      <div className="print-page" id="question-paper-document">
        <div className="print-header">
          <h1>University Name</h1>
          <h2>{paper.exam_type} Examination, {paper.academic_year}</h2>
          <table className="print-meta-table">
            <tbody>
              <tr>
                <td><b>Program:</b> {paper.program}</td>
                <td><b>Semester:</b> {paper.semester}</td>
              </tr>
              <tr>
                <td><b>Course:</b> {paper.course}</td>
                <td><b>Subject:</b> {paper.paper_title.split('-')[1]?.trim() || paper.paper_title}</td>
              </tr>
              <tr>
                <td><b>Max Marks:</b> {paper.total_marks}</td>
                <td><b>Time:</b> 3 Hours</td>
              </tr>
            </tbody>
          </table>
          <div className="print-instructions">
            <b>General Instructions:</b>
            <ul>
              <li>All questions are compulsory unless internal choice is provided.</li>
              <li>Assume suitable data wherever necessary.</li>
            </ul>
          </div>
        </div>
        
        <div className="print-paper-content">
          {sections.map(sec => {
            const secQs = paperQuestions.filter(pq => pq.section_client_id === sec.client_id);
            if(secQs.length === 0) return null;
            
            return (
              <div key={sec.client_id} className="print-section">
                <div className="print-section-title">{sec.name}</div>
                {sec.config?.instructions && <div className="print-section-inst">{sec.config.instructions}</div>}
                <table className="print-q-table">
                  <tbody>
                    {secQs.map((q, index) => {
                      const isOr = q.optional_group_id && index > 0 && secQs[index-1].optional_group_id === q.optional_group_id;
                      return (
                        <React.Fragment key={q.client_id}>
                          {isOr && <tr><td colSpan="3" className="print-or">--- OR ---</td></tr>}
                          <tr>
                            <td className="print-q-num">Q{index + 1}.</td>
                            <td className="print-q-text">
                              <div style={{ whiteSpace: 'pre-wrap' }}>{q.q_data.question_text}</div>
                              {q.q_data.question_type === 'MCQ' && (
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '10px' }}>
                                  {q.q_data.option_a && <div>A. {q.q_data.option_a}</div>}
                                  {q.q_data.option_b && <div>B. {q.q_data.option_b}</div>}
                                  {q.q_data.option_c && <div>C. {q.q_data.option_c}</div>}
                                  {q.q_data.option_d && <div>D. {q.q_data.option_d}</div>}
                                </div>
                              )}
                            </td>
                            <td className="print-q-marks">[{q.q_data.marks}]</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PrintableQuestionPaper;
