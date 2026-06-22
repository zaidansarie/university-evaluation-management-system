import React from 'react';
import './Workflow.css';

function Workflow() {
  const steps = [
    "Question Bank",
    "Question Paper Generation",
    "Answer Sheet Upload",
    "Evaluation",
    "Result Publication",
    "Rechecking Request"
  ];

  return (
    <section className="workflow" id="workflow">
      <h2>How the System Works</h2>
      <div className="workflow-container">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="workflow-step">
              <p>{step}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="workflow-arrow">
                ↓
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default Workflow;
