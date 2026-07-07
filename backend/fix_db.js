const mysql = require('mysql2/promise');

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  await connection.execute(`
    UPDATE answer_sheets 
    SET status = 'Evaluation Submitted' 
    WHERE id = 4
  `);
  
  await connection.execute(`
    UPDATE evaluation_sessions 
    SET total_marks_awarded = '85.50' 
    WHERE id = 1
  `);
  
  console.log('Database fixed. Answer sheet 4 is now Evaluation Submitted and has marks.');
  
  await connection.end();
}

fixDb().catch(console.error);
