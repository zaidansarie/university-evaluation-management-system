const fetch = require('node-fetch'); // Using native fetch or required fetch

async function testRechecking() {
  try {
    console.log('1. Getting dashboard stats...');
    const statsRes = await fetch('http://localhost:5000/api/rechecking/dashboard-stats');
    const stats = await statsRes.json();
    console.log('Stats:', stats);

    console.log('\n2. Creating a Rechecking Request...');
    // I need a student and paper id that has an evaluated answer sheet.
    // I know from previous DB state that student_id 1 has an answer sheet evaluated for paper_id 1.
    // Wait, let's query the DB directly to find one.
    const mysql = require('mysql2/promise');
    const c = await mysql.createConnection({host:'localhost',user:'root',password:'zai827--',database:'university_evaluation_system'});
    
    const [sheets] = await c.query("SELECT id, student_id, paper_id FROM answer_sheets WHERE status = 'Evaluation Submitted' LIMIT 1");
    if (sheets.length === 0) {
      console.log('No evaluated answer sheets found. Skip creation test.');
      return await c.end();
    }
    const { student_id, paper_id } = sheets[0];

    const createRes = await fetch('http://localhost:5000/api/rechecking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id,
        paper_id,
        reason: 'Marks seem too low',
        priority: 'High',
        remarks: 'Test request'
      })
    });
    const createData = await createRes.json();
    console.log('Create Response:', createData);
    
    if (!createData.id) {
       console.log('Failed to create.');
       return await c.end();
    }
    const reqId = createData.id;

    console.log('\n3. Assigning Faculty...');
    const [faculty] = await c.query("SELECT id FROM faculty LIMIT 1");
    if (faculty.length > 0) {
      const assignRes = await fetch(`http://localhost:5000/api/rechecking/${reqId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluator_id: faculty[0].id })
      });
      const assignData = await assignRes.json();
      console.log('Assign Response:', assignData);
    }

    console.log('\n4. Fetching Request Details for Workspace...');
    const getRes = await fetch(`http://localhost:5000/api/rechecking/${reqId}`);
    const getData = await getRes.json();
    console.log(`Workspace Data: Student ${getData.student_name}, Original Marks: ${getData.original_marks}`);
    console.log(`Questions loaded: ${getData.questions.length}`);

    await c.end();
    console.log('\nVerification Complete.');
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testRechecking();
