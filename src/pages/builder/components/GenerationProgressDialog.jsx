import React, { useState, useEffect, useMemo } from 'react';
import { useBuilder } from '../BuilderContext';

function GenerationProgressDialog() {
  const { isGenerating } = useBuilder();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      setStep(0);
      const timers = [
        setTimeout(() => setStep(1), 300),
        setTimeout(() => setStep(2), 600),
        setTimeout(() => setStep(3), 900),
        setTimeout(() => setStep(4), 1200),
        setTimeout(() => setStep(5), 1400)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="modal-overlay" style={{zIndex: 1050}}>
      <div className="modal-content" style={{width: '400px', padding: '30px', textAlign: 'center'}}>
        <h3 style={{marginBottom: '20px', color: '#1e293b'}}>✨ Generating Question Paper...</h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginLeft: '40px'}}>
          <div style={{color: step >= 0 ? '#10b981' : '#cbd5e1', fontWeight: step >= 0 ? 'bold' : 'normal'}}>
            {step >= 0 ? '✓' : '○'} Reading Blueprint
          </div>
          <div style={{color: step >= 1 ? '#10b981' : '#cbd5e1', fontWeight: step >= 1 ? 'bold' : 'normal'}}>
            {step >= 1 ? '✓' : '○'} Selecting Questions
          </div>
          <div style={{color: step >= 2 ? '#10b981' : '#cbd5e1', fontWeight: step >= 2 ? 'bold' : 'normal'}}>
            {step >= 2 ? '✓' : '○'} Balancing Marks & Difficulty
          </div>
          <div style={{color: step >= 3 ? '#10b981' : '#cbd5e1', fontWeight: step >= 3 ? 'bold' : 'normal'}}>
            {step >= 3 ? '✓' : '○'} Balancing Bloom's Levels
          </div>
          <div style={{color: step >= 4 ? '#10b981' : '#cbd5e1', fontWeight: step >= 4 ? 'bold' : 'normal'}}>
            {step >= 4 ? '✓' : '○'} Generating Internal Choices
          </div>
          <div style={{color: step >= 5 ? '#10b981' : '#cbd5e1', fontWeight: step >= 5 ? 'bold' : 'normal'}}>
            {step >= 5 ? '✓' : '○'} Saving Paper...
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerationProgressDialog;
