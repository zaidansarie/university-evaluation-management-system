import React, { useState, useEffect, useRef } from 'react';
import PDFViewer from '../../../components/common/PDFViewer';
import './LinkStudentDialog.css';

function LinkStudentDialog({ sheet, onClose, onLinked }) {
  const [ocrData, setOcrData] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('Loading PDF...');
  const [ocrError, setOcrError] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const canvasRef = useRef(null);
  const pdfUrl = `http://localhost:5000/${sheet.file_path}`;

  // Hook into PDF Page rendering to grab the canvas and run OCR
  const onPageRenderSuccess = async (page, pageNumber) => {
    // Only run OCR once, on the first page
    if (pageNumber === 1 && ocrStatus === 'Rendering page...' && !ocrData) {
      try {
        setOcrStatus('Running OCR...');
        const canvas = document.querySelector('.react-pdf__Page__canvas');
        if (canvas) {
          const imageBase64 = canvas.toDataURL('image/png');
          runOCR(imageBase64);
        }
      } catch (err) {
        console.error("Failed to capture canvas for OCR:", err);
        setOcrError(true);
        setOcrStatus('Failed');
      }
    }
  };

  const runOCR = async (imageBase64) => {
    try {
      setOcrStatus('Extracting fields...');
      const res = await fetch(`http://localhost:5000/api/answer-sheets/${sheet.id}/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      });
      const data = await res.json();
      setOcrData(data);
      
      setOcrStatus('Searching matching student...');
      // Auto-populate search if any identifier found
      const hc = data.detectedFields?.hall_ticket_number?.value;
      const cc = data.detectedFields?.candidate_code?.value;
      const rn = data.detectedFields?.roll_number?.value;
      const query = hc || cc || rn;
      
      if (query) {
        setSearchQuery(query);
        await searchStudents(query);
      } else {
        await searchStudents('', true);
      }
      setOcrStatus('Done');
    } catch (err) {
      setOcrError(true);
      setOcrStatus('Failed');
    }
  };

  const searchStudents = async (query, forceAll = false) => {
    if (!query && !forceAll) {
      setSearchResults([]);
      return;
    }
    try {
      const url = new URL('http://localhost:5000/api/students/search');
      url.searchParams.append('q', query || '');
      if (sheet.course) url.searchParams.append('course', sheet.course);
      if (sheet.semester) url.searchParams.append('semester', sheet.semester);
      if (sheet.program) url.searchParams.append('program', sheet.program);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 1) {
        handleSelectStudent(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 0) {
      searchStudents(q);
    } else {
      searchStudents('', true);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    // Check duplicate
    try {
      const res = await fetch(`http://localhost:5000/api/answer-sheets/check-duplicate?student_id=${student.id}&paper_id=${sheet.paper_id || 1}`); // assuming paper_id is attached to sheet or handled
      const data = await res.json();
      setIsDuplicate(data.duplicateExists);
    } catch (err) {
      console.error("Duplicate check failed", err);
    }
  };

  const handleLink = async () => {
    if (!selectedStudent) return;
    setIsLinking(true);
    try {
      const res = await fetch(`http://localhost:5000/api/answer-sheets/${sheet.id}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudent.id })
      });
      if (res.ok) {
        alert("Student linked successfully."); // Basic toast
        onLinked();
      } else {
        alert("Failed to link student.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to link student.");
    } finally {
      setIsLinking(false);
    }
  };

  const getConfBadge = (conf) => {
    if (!conf) return null;
    if (conf >= 90) return <span className="conf-badge conf-high">🟢 {Math.round(conf)}%</span>;
    if (conf >= 60) return <span className="conf-badge conf-med">🟡 {Math.round(conf)}%</span>;
    return <span className="conf-badge conf-low">🔴 {Math.round(conf)}%</span>;
  };

  return (
    <div className="link-modal-overlay">
      <div className="link-modal">
        <div className="link-modal-header">
          <h2>OCR-Assisted Link Student</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="link-modal-body">
          {/* LEFT PANE: PDF VIEWER */}
          <PDFViewer 
            pdfUrl={pdfUrl} 
            onPageRenderSuccess={onPageRenderSuccess} 
          />

          {/* RIGHT PANE: OCR & LINKING */}
          <div className="ocr-pane">
            
            {/* OCR CARD */}
            <div className="ocr-card">
              <h3>Detected Student Information</h3>
              {ocrStatus !== 'Done' && ocrStatus !== 'Failed' ? (
                <div style={{color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span className="spinner"></span> {ocrStatus}
                </div>
              ) : ocrError || (!ocrData?.detectedFields?.roll_number && !ocrData?.detectedFields?.candidate_code && !ocrData?.detectedFields?.hall_ticket_number) ? (
                <div className="error-alert">
                  No Identifiers could be detected. Please inspect the PDF manually and search for the correct student.
                </div>
              ) : (
                <div>
                  <div className="ocr-field">
                    <div>
                      <div className="ocr-label">Roll Number</div>
                      <div className="ocr-val">{ocrData.detectedFields?.roll_number?.value || <span style={{color: '#94a3b8'}}>Not detected</span>}</div>
                    </div>
                    {getConfBadge(ocrData.detectedFields?.roll_number?.confidence)}
                  </div>
                  <div className="ocr-field">
                    <div>
                      <div className="ocr-label">Candidate Code</div>
                      <div className="ocr-val">{ocrData.detectedFields?.candidate_code?.value || <span style={{color: '#94a3b8'}}>Not detected</span>}</div>
                    </div>
                    {getConfBadge(ocrData.detectedFields?.candidate_code?.confidence)}
                  </div>
                  <div className="ocr-field">
                    <div>
                      <div className="ocr-label">Student Name</div>
                      <div className="ocr-val">{ocrData.detectedFields?.student_name?.value || <span style={{color: '#94a3b8'}}>Not detected</span>}</div>
                    </div>
                    {getConfBadge(ocrData.detectedFields?.student_name?.confidence)}
                  </div>
                </div>
              )}
            </div>

            {/* SEARCH */}
            <div className="search-section">
              <h3>Search Student</h3>
              <input 
                type="text" 
                className="search-box" 
                placeholder="Roll Number, Candidate Code, or Name..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              
              {!selectedStudent && searchQuery.length > 0 && searchResults.length === 0 && (
                <div style={{textAlign: 'center', margin: '20px 0'}}>
                  <div style={{color: '#64748b', marginBottom: '10px'}}>No students found for this examination context.</div>
                </div>
              )}

              {!selectedStudent && searchResults.length > 0 && (
                <>
                  <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '8px'}}>Eligible Students</div>
                  <div style={{border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', marginBottom: '20px'}}>
                    {searchResults.map(s => (
                      <div 
                        key={s.id} 
                        style={{padding: '10px 15px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer'}}
                        onClick={() => handleSelectStudent(s)}
                      >
                        <div style={{fontWeight: '600'}}>{s.name}</div>
                        <div style={{fontSize: '0.85rem', color: '#64748b'}}>Roll: {s.roll_number}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* STUDENT PREVIEW */}
            {selectedStudent && (
              <div className="student-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                  <h3 style={{margin: 0, color: '#0f172a'}}>Suggested Match</h3>
                  <button 
                    style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem'}}
                    onClick={() => { setSelectedStudent(null); setIsDuplicate(false); }}
                  >
                    Change
                  </button>
                </div>
                
                <div className="student-name">{selectedStudent.name}</div>
                <div className="student-detail"><span>Roll Number</span><span>{selectedStudent.roll_number}</span></div>
                <div className="student-detail"><span>Candidate Code</span><span>{selectedStudent.candidate_code || '--'}</span></div>
                <div className="student-detail"><span>Course</span><span>{selectedStudent.course}</span></div>
                <div className="student-detail"><span>Programme</span><span>{selectedStudent.program}</span></div>
                <div className="student-detail"><span>Semester</span><span>{selectedStudent.semester}</span></div>
              </div>
            )}

            {/* DUPLICATE WARNING */}
            {isDuplicate && (
              <div className="warning-alert">
                <div style={{fontWeight: '600', marginBottom: '5px'}}>Duplicate Record Detected</div>
                This student already has an Examination Answer Sheet linked for this Question Paper. Please review the existing record before creating another link.
              </div>
            )}

            {/* ACTIONS */}
            <div style={{marginTop: 'auto', display: 'flex', gap: '15px'}}>
              {isDuplicate ? (
                <>
                  <button className="as-btn as-btn-secondary" style={{flex: 1}} onClick={onClose}>Cancel</button>
                  <button className="as-btn as-btn-secondary" style={{flex: 1}}>View Existing</button>
                </>
              ) : (
                <button 
                  className="as-btn as-btn-primary" 
                  style={{width: '100%', padding: '12px'}}
                  disabled={!selectedStudent || isLinking}
                  onClick={handleLink}
                >
                  {isLinking ? 'Linking...' : 'Link Student'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkStudentDialog;
