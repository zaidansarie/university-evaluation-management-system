import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <section className="contact" id="contact">
      <h2>Contact</h2>
      <div className="contact-card">
        <h3>University Evaluation Management System (UEMS)</h3>
        <p className="contact-desc">Developed as part of an internship project focused on digitizing university examination and evaluation workflows.</p>
        <div className="contact-info">
          <p><strong>Email:</strong> <a href="mailto:info@uems.com">info@uems.com</a></p>
          <p><strong>Phone:</strong> +91 XXXXX XXXXX</p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
