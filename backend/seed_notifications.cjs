const mysql = require('mysql2/promise');

async function seed() {
  const c = await mysql.createConnection({host:'localhost', user:'root', password:'zai827--', database:'university_evaluation_system'});
  
  const adminNotifs = [
    [1, 'Question Bank', 'Faculty submitted new questions for approval', 'Dr. Sharma has submitted 15 new DBMS questions.', 0, new Date(Date.now() - 30 * 60000)],
    [1, 'Evaluation Assignment', 'Evaluation assignment conflict detected', 'Dr. Khan is assigned to evaluate papers for two conflicting sessions.', 0, new Date(Date.now() - 2 * 3600000)],
    [1, 'Evaluation Management', 'Faculty completed evaluation', 'Dr. Singh has completed evaluating 30 Operating Systems answer sheets.', 1, new Date(Date.now() - 24 * 3600000)],
    [1, 'Rechecking Requests', 'New student rechecking request received', 'Student Amit Kumar has requested rechecking for Mathematics IV.', 0, new Date(Date.now() - 2 * 24 * 3600000)],
    [1, 'Results', 'All evaluations completed', 'All assigned evaluations for B.Tech CSE Semester III have been completed.', 0, new Date(Date.now() - 3 * 24 * 3600000)],
    [1, 'Answer Sheet Uploads', 'Missing answer sheet detected', 'Answer sheet barcode 987654321 is missing from the scanned batch.', 0, new Date(Date.now() - 4 * 24 * 3600000)],
    [1, 'System', 'Scheduled system maintenance', 'Database backup and indexing scheduled for Sunday 2:00 AM.', 1, new Date(Date.now() - 5 * 24 * 3600000)]
  ];

  const facultyNotifs = [
    [2, 'Evaluation Assignments', 'New Evaluation Assigned', '15 DBMS Semester III answer sheets have been assigned to you.', 0, new Date(Date.now() - 10 * 60000)],
    [2, 'Rechecking Requests', 'New Rechecking Request', 'A DBMS rechecking request has been assigned for review.', 0, new Date(Date.now() - 60 * 60000)],
    [2, 'Deadlines', 'Draft Evaluation Reminder', 'You have 3 draft evaluations waiting for submission.', 1, new Date(Date.now() - 24 * 3600000)],
    [2, 'Deadlines', 'Evaluation Deadline', 'DBMS evaluation deadline is tomorrow.', 0, new Date(Date.now() - 2 * 3600000)],
    [2, 'Question Bank', 'Question Bank Approved', 'Your submitted Operating Systems questions have been approved.', 1, new Date(Date.now() - 3 * 24 * 3600000)],
    [2, 'Announcements', 'System Maintenance', 'The examination portal will undergo maintenance this Sunday from 11:00 PM to 1:00 AM.', 1, new Date(Date.now() - 5 * 24 * 3600000)]
  ];

  const studentNotifs = [
    [4, 'Results', 'Result Published', 'The final results for Semester III have been published.', 0, new Date(Date.now() - 30 * 60000)],
    [4, 'Answer Sheets', 'Answer Sheet Available', 'Your DBMS answer sheet is now available for viewing.', 0, new Date(Date.now() - 2 * 3600000)],
    [4, 'Results', 'Digital Marksheet Available', 'You can now download your verified digital marksheet.', 1, new Date(Date.now() - 24 * 3600000)],
    [4, 'Rechecking', 'Rechecking Request Submitted', 'Your request for rechecking Operating Systems has been received.', 1, new Date(Date.now() - 2 * 24 * 3600000)],
    [4, 'Subjects', 'New Subject Added', 'A new elective subject has been added to your curriculum.', 0, new Date(Date.now() - 3 * 24 * 3600000)],
    [4, 'Profile', 'Profile Updated Successfully', 'Your contact information was successfully updated.', 1, new Date(Date.now() - 4 * 24 * 3600000)],
    [4, 'System', 'System Maintenance', 'The student portal will undergo maintenance this Sunday from 11:00 PM to 1:00 AM.', 1, new Date(Date.now() - 5 * 24 * 3600000)]
  ];

  for (const n of adminNotifs) {
    await c.query('INSERT INTO notifications (admin_id, type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)', n);
  }
  
  for (const n of facultyNotifs) {
    await c.query('INSERT INTO notifications (faculty_id, type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)', n);
  }
  
  for (const n of studentNotifs) {
    await c.query('INSERT INTO notifications (student_id, type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)', n);
  }

  console.log('Successfully seeded mock notifications into the database!');
  c.end();
}

seed().catch(console.error);
