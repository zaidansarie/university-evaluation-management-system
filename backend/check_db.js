const mysql = require('mysql2/promise');

async function checkDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  const [rows] = await connection.execute(`
    SELECT * FROM evaluation_sessions
  `);
  console.log('Completed evaluations:', rows);
  
  await connection.end();
}

checkDb().catch(console.error);
