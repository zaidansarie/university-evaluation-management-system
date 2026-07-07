const mysql = require('mysql2/promise');

async function checkDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'uems'
  });

  const [rows] = await connection.execute(`
    SELECT a.*, q.academic_year, q.exam_type, q.program, q.course, q.semester
    FROM answer_sheets a
    JOIN question_papers q ON a.paper_id = q.id
    WHERE a.status = 'Evaluation Submitted'
  `);
  console.log('Completed evaluations:', rows);
  
  await connection.end();
}

checkDb().catch(console.error);
