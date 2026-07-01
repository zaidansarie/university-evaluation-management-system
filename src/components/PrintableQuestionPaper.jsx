import React from 'react';
import './PrintableQuestionPaper.css';

function PrintableQuestionPaper({ paper, sections, paperQuestions, onBack }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-preview-overlay">
      <div className="print-preview-toolbar no-print">
        <button className="btn-back" onClick={onBack}>← Back to Editor</button>
        <div style={{display:'flex', gap:'10px'}}>
          <button className="btn-print" onClick={handlePrint}>🖨️ Print / Download PDF</button>
        </div>
      </div>

      <div className="print-page">
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
                            <td className="print-q-text">{q.q_data.question_text}</td>
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
