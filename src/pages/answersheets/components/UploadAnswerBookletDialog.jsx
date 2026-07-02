import React, { useState, useEffect } from 'react';
import './UploadDialog.css';

function UploadAnswerBookletDialog({ onClose, onUploadComplete, questionPaper, paperId }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Results
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Filter PDFs only (already handled by accept attribute, but safe check)
    const validFiles = files.filter(f => f.type === 'application/pdf');
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(f => f.type === 'application/pdf');
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!paperId || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('paper_id', paperId);
    selectedFiles.forEach(file => {
      formData.append('pdfs', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/answer-sheets/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        setUploadResults(data.results);
        setStep(2); // Move to results step
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h2>Upload Answer Booklets</h2>
          <button className="close-btn" onClick={onClose} disabled={isUploading}>×</button>
        </div>

        <div className="upload-modal-body">
          {/* Read-only Examination Context */}
          <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px'}}>
            <div style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px'}}>Target Examination</div>
            <div style={{fontWeight: '600', color: '#0f172a', fontSize: '1.05rem'}}>{questionPaper.exam_type} - {questionPaper.subject_name}</div>
            <div style={{fontSize: '0.9rem', color: '#475569', marginTop: '4px'}}>
              Semester {questionPaper.semester} • AY {questionPaper.academic_year}
            </div>
          </div>

          {/* STEP 1: Upload Files */}
          {step === 1 && (
            <div className="upload-step">
              <p className="step-desc">All uploaded PDFs will be automatically linked to this examination.</p>
              
              <div 
                className="drop-zone" 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
              >
                <div className="drop-icon">📄</div>
                <h4>Drag & Drop PDFs here</h4>
                <p>or</p>
                <label className="browse-btn">
                  Browse Files
                  <input type="file" multiple accept="application/pdf" onChange={handleFileChange} hidden />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <div className="files-header">
                    <h4>Selected Files ({selectedFiles.length})</h4>
                  </div>
                  <ul className="file-list">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button className="remove-file-btn" onClick={() => removeFile(index)} disabled={isUploading}>×</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-actions" style={{marginTop: '30px', justifyContent: 'flex-end'}}>
                <button 
                  className="as-btn as-btn-primary" 
                  disabled={selectedFiles.length === 0 || isUploading}
                  onClick={handleUpload}
                  style={{display: 'flex', gap: '10px', alignItems: 'center'}}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner" style={{width:'16px',height:'16px',border:'2px solid white',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}></span>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length} Booklets`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Auto-Linking Results */}
          {step === 2 && (
            <div className="upload-step">
              <h3 style={{color: '#16a34a'}}>Upload Complete!</h3>
              <p className="step-desc">The system has attempted to automatically match Roll Numbers based on the filenames.</p>
              
              <div className="results-summary">
                <div className="result-stat matched">
                  <span className="stat-num">{uploadResults.filter(r => r.matched).length}</span>
                  <span className="stat-label">Auto-Linked</span>
                </div>
                <div className="result-stat manual">
                  <span className="stat-num">{uploadResults.filter(r => !r.matched).length}</span>
                  <span className="stat-label">Needs Manual Linking</span>
                </div>
              </div>

              <div className="results-list-container">
                <table className="as-table results-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Match Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResults.map((res, i) => (
                      <tr key={i}>
                        <td>{res.original_filename}</td>
                        <td>
                          {res.matched ? (
                            <span className="as-badge as-badge-completed">Auto-Linked</span>
                          ) : (
                            <span className="as-badge as-badge-rechecking">Needs Manual Link</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions" style={{marginTop: '30px', justifyContent: 'flex-end'}}>
                <button 
                  className="as-btn as-btn-primary" 
                  onClick={() => {
                    onUploadComplete();
                    onClose();
                  }}
                >
                  Finish & Refresh Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadAnswerBookletDialog;
