import React, { useState, useEffect } from 'react';
import './UploadDialog.css';

function UploadAnswerBookletDialog({ onClose, onUploadComplete }) {
  const [step, setStep] = useState(1); // 1: Select Paper, 2: Upload, 3: Results
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  useEffect(() => {
    // Fetch all question papers
    fetch('http://localhost:5000/api/question-papers')
      .then(res => res.json())
      .then(data => setPapers(data))
      .catch(err => console.error(err));
  }, []);

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
    if (!selectedPaper || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('paper_id', selectedPaper);
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
        setStep(3); // Move to results step
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
          {/* STEP 1: Select Question Paper */}
          {step === 1 && (
            <div className="upload-step">
              <h3>Step 1: Select Question Paper context</h3>
              <p className="step-desc">All uploaded PDFs will be automatically linked to this specific examination context.</p>
              
              <div className="form-group" style={{marginTop: '20px'}}>
                <label>Question Paper</label>
                <select 
                  value={selectedPaper} 
                  onChange={(e) => setSelectedPaper(e.target.value)}
                  className="paper-select"
                >
                  <option value="" disabled>Select the examination paper...</option>
                  {papers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.exam_type} - {p.paper_title} (Sem {p.semester} • {p.academic_year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions" style={{marginTop: '40px', justifyContent: 'flex-end'}}>
                <button 
                  className="as-btn as-btn-primary" 
                  disabled={!selectedPaper}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: File Upload (Drag & Drop) */}
          {step === 2 && (
            <div className="upload-step">
              <h3>Step 2: Upload PDFs</h3>
              <p className="step-desc">Drag and drop scanned answer booklets here. Only PDF format is supported.</p>
              
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

              <div className="modal-actions" style={{marginTop: '30px', justifyContent: 'space-between'}}>
                <button className="as-btn as-btn-secondary" onClick={() => setStep(1)} disabled={isUploading}>
                  ← Back
                </button>
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

          {/* STEP 3: Auto-Linking Results */}
          {step === 3 && (
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
