import React from 'react';
import './Roles.css';

function Roles() {
  const roles = [
    { title: "Student", description: "View exams, check results, and submit rechecking requests." },
    { title: "Faculty", description: "Manage question banks, evaluate papers, and grade students." },
    { title: "Admin", description: "Manage faculty, students, examinations, and evaluation activities for a specific university." }
  ];

  return (
    <section className="roles" id="roles">
      <h2>User Roles</h2>
      <div className="roles-grid">
        {roles.map((role, index) => (
          <div className="role-card" key={index}>
            <h3>{role.title}</h3>
            <p>{role.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Roles;
