import React from 'react';
import './Features.css';

function Features() {
  const featureList = [
    { title: "Question Bank", description: "Securely store and manage all examination questions in one place." },
    { title: "Question Paper Generator", description: "Automatically generate question papers for any subject." },
    { title: "Evaluation", description: "Faculty can evaluate physical and digital answer sheets and assign marks." },
    { title: "Results", description: "Automated result processing and publishing for students." },
    { title: "Rechecking Requests", description: "Students can request re-evaluation of their answer sheets." }
  ];

  return (
    <section className="features" id="features">
      <h2>Key Features</h2>
      <div className="features-grid">
        {featureList.map((feature, index) => (
          <div className="feature-card" key={index}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
