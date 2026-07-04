import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import APIError from '../../components/common/APIError';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import './AnswerSheets.css';

function ExaminationDirectory() {
  const navigate = useNavigate();
  const { data: examinations, loading, error, refetch } = useApiData('/api/examinations/directory');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExaminations = (examinations || []).filter(exam => {
    const query = searchQuery.toLowerCase();
    return (
      (exam.subject_name || '').toLowerCase().includes(query) ||
      (exam.subject_code || '').toLowerCase().includes(query) ||
      (exam.exam_type || '').toLowerCase().includes(query) ||
      (exam.course || '').toLowerCase().includes(query) ||
      (exam.program || '').toLowerCase().includes(query) ||
      (exam.academic_year || '').toLowerCase().includes(query) ||
      (exam.semester && exam.semester.toString().includes(query))
    );
  });

  return (
    <div className="answer-sheet-dashboard">
      <h1>Examination Directory</h1>
      <p style={{color: '#64748b', marginBottom: '20px'}}>
        Select an examination below to manage its uploaded answer sheets and evaluation workflow.
      </p>

      <div style={{marginBottom: '30px', maxWidth: '500px'}}>
        <input 
          type="text" 
          placeholder="Search by Subject, Programme, Course, Semester, Exam Type, or AY..." 
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{padding: '20px'}}>
           <SkeletonLoader lines={6} height="120px" />
        </div>
      ) : error ? (
        <APIError error={error} onRetry={() => refetch(true)} resourceName="Examinations" />
      ) : filteredExaminations.length === 0 ? (
        <div style={{padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
          <p style={{color: '#64748b', fontSize: '1.1rem'}}>No eligible examinations found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredExaminations.map(exam => (
            <div key={exam.id} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '0.85rem', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px'}}>
                  {exam.exam_type}
                </div>
                <h3 style={{margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.15rem', lineHeight: '1.4'}}>
                  {exam.subject_name} ({exam.subject_code})
                </h3>
                <div style={{fontSize: '0.9rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                  <span><strong>Programme:</strong> {exam.course} {exam.program}</span>
                </div>
                <div style={{fontSize: '0.9rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                  <span><strong>Semester:</strong> {exam.semester}</span>
                  <span style={{color: '#cbd5e1'}}>•</span>
                  <span><strong>AY:</strong> {exam.academic_year}</span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.85rem'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#64748b'}}>Uploaded:</span>
                  <strong style={{color: '#0f172a'}}>{exam.total_uploaded}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#64748b'}}>Linked:</span>
                  <strong style={{color: '#0f172a'}}>{exam.linked}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#64748b'}}>Pending:</span>
                  <strong style={{color: '#0f172a'}}>{exam.pending_linking}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#64748b'}}>Evaluating:</span>
                  <strong style={{color: '#0f172a'}}>{exam.under_evaluation}</strong>
                </div>
              </div>

              <button 
                className="as-btn as-btn-primary" 
                style={{width: '100%', marginTop: 'auto', padding: '10px'}}
                onClick={() => navigate(`/admin/examination-answer-sheets/${exam.id}`)}
              >
                Open Examination
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExaminationDirectory;
