const axios = require('axios');
const mysql = require('mysql2/promise');

const API = 'http://localhost:5000/api';

async function testWorkflows() {
  const db = await mysql.createConnection({host:'localhost', user:'root', password:'zai827--', database:'university_evaluation_system'});
  
  console.log('--- CLEARING OLD NOTIFICATIONS ---');
  await db.query('DELETE FROM notifications');

  try {
    // 1. Publish Result
    console.log('\\n[TEST 1] Publish Result');
    await axios.put(`${API}/results/5/publish`);
    const [resPub] = await db.query('SELECT * FROM notifications WHERE type = "Results"');
    console.log('Notifications generated:', resPub.length);
    console.log('Sample Row:', resPub[0]);

    // 2. Evaluate Answer Sheet
    console.log('\\n[TEST 2] Evaluate Answer Sheet');
    // Session 2 is completed, we'll hit save with isComplete=true
    await axios.post(`${API}/evaluations/session/2/save`, { marks: [], isComplete: true });
    const [evalSheet] = await db.query('SELECT * FROM notifications WHERE type = "Evaluation Management" OR type = "Answer Sheet Evaluated"');
    console.log('Notifications generated:', evalSheet.length);
    console.log('Sample Row (Admin):', evalSheet.find(n => n.admin_id));
    console.log('Sample Row (Student):', evalSheet.find(n => n.student_id));

    // 3. Submit Rechecking
    console.log('\\n[TEST 3] Submit Rechecking');
    // student_id = 4, paper_id = 3
    const recheckingRes = await axios.post(`${API}/rechecking`, { student_id: 4, paper_id: 3, reason: 'Test Reason' }).catch(e => e.response);
    let reqId = null;
    if (recheckingRes.data && recheckingRes.data.id) {
      reqId = recheckingRes.data.id;
      console.log('Rechecking request created:', reqId);
    } else {
      console.log('Failed to create rechecking:', recheckingRes.data);
      // maybe one already exists?
      const [existing] = await db.query('SELECT id FROM rechecking_requests WHERE student_id = 4 LIMIT 1');
      if (existing.length > 0) reqId = existing[0].id;
    }
    const [subRecheck] = await db.query('SELECT * FROM notifications WHERE type = "Rechecking Requests" OR type = "Rechecking Request Submitted" ORDER BY created_at DESC LIMIT 2');
    console.log('Notifications generated:', subRecheck.length);
    console.log('Rows:', subRecheck);

    // 4. Assign Rechecking
    console.log('\\n[TEST 4] Assign Rechecking');
    if (reqId) {
      await axios.put(`${API}/rechecking/${reqId}/assign`, { evaluator_id: 2 });
      const [assRecheck] = await db.query('SELECT * FROM notifications WHERE type = "Rechecking Assigned" OR (type = "Rechecking Requests" AND faculty_id = 2) ORDER BY created_at DESC LIMIT 2');
      console.log('Notifications generated:', assRecheck.length);
      console.log('Rows:', assRecheck);
    }

    // 5. Update Profile
    console.log('\\n[TEST 5] Update Profile');
    await axios.put(`${API}/students/4/profile`, { phone_number: '9999999999', address: 'Test Addr' });
    const [updProf] = await db.query('SELECT * FROM notifications WHERE type = "Profile"');
    console.log('Notifications generated:', updProf.length);
    console.log('Sample Row:', updProf[0]);

    // 6. Assign Answer Sheets
    console.log('\\n[TEST 6] Assign Answer Sheets');
    await axios.post(`${API}/answer-sheets/assign`, { sheetIds: [2], facultyId: 2, reason: 'Test Assign' });
    const [assSheets] = await db.query('SELECT * FROM notifications WHERE type = "Evaluation Assignments"');
    console.log('Notifications generated:', assSheets.length);
    console.log('Sample Row:', assSheets[0]);

    // 7. Question Bank Bulk
    console.log('\\n[TEST 7] Faculty Submits Question Bank');
    await axios.post(`${API}/questions/bulk`, { questions: [{ question_code: 'Q_TEST_101', subject_id: 2, unit: 1, question_text: 'Test', question_type: 'MCQ', blooms_level: 'L1', difficulty_level: 'Easy', marks: 1, created_by: 2, option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'A' }] });
    const [qbBulk] = await db.query('SELECT * FROM notifications WHERE title LIKE "%Faculty submitted new questions%"');
    console.log('Notifications generated:', qbBulk.length);
    console.log('Sample Row:', qbBulk[0]);
    const [qIdRes] = await db.query('SELECT id FROM questions WHERE question_code = "Q_TEST_101"');
    const qId = qIdRes[0].id;

    // 8. Question Bank Review
    console.log('\\n[TEST 8] Approve Question Bank');
    await axios.put(`${API}/questions/${qId}/review`, { status: 'Approved', reviewed_by: 1 });
    const [qbRev] = await db.query('SELECT * FROM notifications WHERE title = "Question Bank Approved"');
    console.log('Notifications generated:', qbRev.length);
    console.log('Sample Row:', qbRev[0]);

    // 9. Missing Answer Sheet
    console.log('\\n[TEST 9] Missing Answer Sheet');
    // To trigger missing, we just upload a file without a number in it (or a number not matching any roll)
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    form.append('paper_id', 3);
    fs.writeFileSync('test_upload.pdf', 'dummy content');
    form.append('pdfs', fs.createReadStream('test_upload.pdf'));
    await axios.post(`${API}/answer-sheets/upload`, form, { headers: form.getHeaders() });
    const [missSheet] = await db.query('SELECT * FROM notifications WHERE title = "Missing answer sheet detected"');
    console.log('Notifications generated:', missSheet.length);
    console.log('Sample Row:', missSheet[0]);

    // 10. System Maintenance (Stub)
    console.log('\\n[TEST 10] System Maintenance');
    await axios.post(`${API}/system/maintenance`, { date: 'Monday', time: '12:00 PM' });
    const [sysMaint] = await db.query('SELECT * FROM notifications WHERE title = "Scheduled system maintenance" OR title = "System Maintenance"');
    console.log('Notifications generated:', sysMaint.length);
    console.log('Sample Row Admin:', sysMaint.find(n => n.admin_id));

  } catch (err) {
    console.error('Test Error:', err.response ? err.response.data : err.message);
  } finally {
    db.end();
  }
}

testWorkflows();
