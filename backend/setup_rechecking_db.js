const mysql = require('mysql2/promise');

async function setupRecheckingDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'zai827--',
      database: 'university_evaluation_system'
    });

    console.log('Connected to the database.');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rechecking_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        paper_id INT NOT NULL,
        answer_sheet_id INT NOT NULL,
        reason TEXT,
        priority VARCHAR(20) DEFAULT 'Normal',
        remarks TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        evaluator_id INT DEFAULT NULL,
        original_marks DECIMAL(5, 2),
        revised_marks DECIMAL(5, 2) DEFAULT NULL,
        requested_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_on DATETIME DEFAULT NULL,
        completed_on DATETIME DEFAULT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (paper_id) REFERENCES question_papers(id) ON DELETE CASCADE,
        FOREIGN KEY (answer_sheet_id) REFERENCES answer_sheets(id) ON DELETE CASCADE,
        FOREIGN KEY (evaluator_id) REFERENCES faculty(id) ON DELETE SET NULL
      )
    `);
    console.log('rechecking_requests table ensured.');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rechecking_marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        question_id INT NOT NULL,
        original_mark DECIMAL(5, 2),
        revised_mark DECIMAL(5, 2),
        remarks TEXT,
        FOREIGN KEY (request_id) REFERENCES rechecking_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES paper_questions(id) ON DELETE CASCADE
      )
    `);
    console.log('rechecking_marks table ensured.');

  } catch (error) {
    console.error('Error setting up DB:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

setupRecheckingDB();
