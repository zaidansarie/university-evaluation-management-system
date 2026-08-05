const axios = require('axios');
const mysql = require('mysql2/promise');
const FormData = require('form-data');
const fs = require('fs');

const API = 'http://localhost:5000/api';
let db;

async function query(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

async function verifyWorkflow(name, action, checkSql) {
  console.log(`\\n========================================`);
  console.log(`WORKFLOW: ${name}`);
  console.log(`========================================`);
  
  const [beforeCount] = await query('SELECT COUNT(*) as c FROM notifications');
  console.log(`Count Before: ${beforeCount.c}`);

  let apiResponse;
  try {
    apiResponse = await action();
    console.log(`API Response:`, apiResponse);
  } catch (err) {
    apiResponse = err.response ? err.response.data : err.message;
    console.log(`API Response (Error):`, apiResponse);
  }

  // Wait for async inserts
  await new Promise(r => setTimeout(r, 500));

  const rows = await query(checkSql);
  if (rows.length > 0) {
    console.log(`\\nSQL SELECT Result:`);
    console.log(rows[0]);
    console.log(`Notification ID Created: ${rows[0].id}`);
  } else {
    console.log(`\\nSQL SELECT Result: No rows found!`);
  }

  const [afterCount] = await query('SELECT COUNT(*) as c FROM notifications');
  console.log(`\\nCount After: ${afterCount.c}`);
  
  return rows[0] ? rows[0].id : null;
}

async function runAll() {
  db = await mysql.createConnection({host:'localhost', user:'root', password:'zai827--', database:'university_evaluation_system'});
  
  await query('DELETE FROM notifications');
  console.log('Cleared all notifications.\\n');

  // 1. Publish Result
  await verifyWorkflow('Admin: Publish Result', 
    () => axios.put(`${API}/results/5/publish`).then(r => r.data),
    'SELECT * FROM notifications WHERE type = "Results" ORDER BY id DESC LIMIT 1'
  );

  // 2. Evaluate Answer Sheet
  await verifyWorkflow('Faculty: Evaluate Answer Sheet', 
    () => axios.post(`${API}/evaluations/session/2/save`, { marks: [], isComplete: true }).then(r => r.data),
    'SELECT * FROM notifications WHERE type = "Evaluation Management" ORDER BY id DESC LIMIT 1'
  );

  // 3. Submit Rechecking
  await verifyWorkflow('Student: Submit Rechecking', 
    () => axios.post(`${API}/rechecking`, { student_id: 17, paper_id: 3, reason: 'Test Reason' }).then(r => r.data),
    'SELECT * FROM notifications WHERE type = "Rechecking Request Submitted" ORDER BY id DESC LIMIT 1'
  );

  // 4. Assign Rechecking
  const [recheckReqs] = await query('SELECT id FROM rechecking_requests WHERE student_id = 17 ORDER BY id DESC LIMIT 1');
  if (recheckReqs.length > 0) {
    await verifyWorkflow('Admin: Assign Rechecking', 
      () => axios.put(`${API}/rechecking/${recheckReqs[0].id}/assign`, { evaluator_id: 2 }).then(r => r.data),
      'SELECT * FROM notifications WHERE type = "Rechecking Requests" AND faculty_id = 2 ORDER BY id DESC LIMIT 1'
    );
  }

  // 5. Update Profile
  await verifyWorkflow('Student: Update Profile', 
    () => axios.put(`${API}/students/4/profile`, { phone_number: '1234567890', address: 'Updated' }).then(r => r.data),
    'SELECT * FROM notifications WHERE type = "Profile" AND student_id = 4 ORDER BY id DESC LIMIT 1'
  );

  // 6. Assign Answer Sheets
  await verifyWorkflow('Admin: Assign Answer Sheets', 
    () => axios.post(`${API}/answer-sheets/assign`, { sheetIds: [2], facultyId: 2, reason: 'Assignment' }).then(r => r.data),
    'SELECT * FROM notifications WHERE type = "Evaluation Assignments" AND faculty_id = 2 ORDER BY id DESC LIMIT 1'
  );

  // 7. Faculty Submits Question Bank
  await verifyWorkflow('Faculty: Submits Question Bank', 
    () => axios.post(`${API}/questions/bulk`, { questions: [{ question_code: 'Q_TEST_PROOF', subject_id: 2, unit: 1, question_text: 'Test', question_type: 'MCQ', blooms_level: 'L1', difficulty_level: 'Easy', marks: 1, created_by: 2, option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'A' }] }).then(r => r.data),
    'SELECT * FROM notifications WHERE type = "Question Bank" AND admin_id = 1 ORDER BY id DESC LIMIT 1'
  );

  // 8. Approve Question Bank
  const [qRes] = await query('SELECT id FROM questions WHERE question_code = "Q_TEST_PROOF" ORDER BY id DESC LIMIT 1');
  if (qRes.length > 0) {
    await verifyWorkflow('Admin: Approve Question Bank', 
      () => axios.put(`${API}/questions/${qRes[0].id}/review`, { status: 'Approved', reviewed_by: 1 }).then(r => r.data),
      'SELECT * FROM notifications WHERE title = "Question Bank Approved" AND faculty_id = 2 ORDER BY id DESC LIMIT 1'
    );
  }

  // 9. Missing Answer Sheet
  fs.writeFileSync('test_miss.pdf', 'dummy content');
  const form = new FormData();
  form.append('paper_id', 3);
  form.append('pdfs', fs.createReadStream('test_miss.pdf'));
  await verifyWorkflow('Admin: Missing Answer Sheet', 
    () => axios.post(`${API}/answer-sheets/upload`, form, { headers: form.getHeaders() }).then(r => r.data),
    'SELECT * FROM notifications WHERE title = "Missing answer sheet detected" AND admin_id = 1 ORDER BY id DESC LIMIT 1'
  );

  // 10. System Maintenance
  await verifyWorkflow('Admin: System Maintenance', 
    () => axios.post(`${API}/system/maintenance`, { date: 'Tuesday', time: '2:00 AM' }).then(r => r.data),
    'SELECT * FROM notifications WHERE title = "Scheduled system maintenance" AND admin_id = 1 ORDER BY id DESC LIMIT 1'
  );

  await db.end();
}

runAll();
