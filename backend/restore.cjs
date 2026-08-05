const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system',
    multipleStatements: true
  });

  try {
    await db.query(`
      DELETE FROM notifications;
      ALTER TABLE notifications AUTO_INCREMENT = 1;
      
      INSERT INTO notifications 
        (id, student_id, type, title, message, related_id, related_module, is_read, created_at) 
      VALUES 
        (1, 4, 'Answer Sheet Evaluated', 'Answer Sheet Evaluated', 'Your End Semester - Programming in C (CSE101) - Sem 1 - AY 2026-27 answer sheet has been evaluated.', 1, 'Evaluation', 0, '2026-08-01 10:41:59'),
        (3, 4, 'Answer Sheet Evaluated', 'Answer Sheet Evaluated', 'Your End Semester - Programming in C (CSE101) - Sem 1 - AY 2026-27 answer sheet has been evaluated.', 3, 'Evaluation', 0, '2026-08-01 11:44:32'),
        (5, 4, 'Result Published', 'Result Published', 'Your End Semester result for Semester 1 has been published.', 5, 'Results', 0, '2026-08-02 03:05:57');
    `);
    console.log('Successfully restored original baseline notifications.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.end();
  }
}

run();
