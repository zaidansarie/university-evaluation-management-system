const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  try {
    const [res1] = await conn.query("UPDATE evaluation_sessions SET status = 'Completed' WHERE status IN ('Evaluation Submitted', 'Submitted', 'Locked')");
    console.log('Updated evaluation_sessions:', res1.affectedRows);

    const [res2] = await conn.query("UPDATE answer_sheets SET status = 'Completed' WHERE status IN ('Evaluation Submitted', 'Submitted', 'Locked')");
    console.log('Updated answer_sheets:', res2.affectedRows);

    const [res3] = await conn.query("UPDATE evaluation_assignments SET status = 'Completed' WHERE answer_sheet_id IN (SELECT answer_sheet_id FROM evaluation_sessions WHERE status = 'Completed')");
    console.log('Updated evaluation_assignments:', res3.affectedRows);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}

run();
