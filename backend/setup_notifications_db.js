const mysql = require('mysql2/promise');

async function setupNotificationsDB() {
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
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        type VARCHAR(50) NOT NULL, 
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_id INT,
        related_module VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    console.log('notifications table ensured.');

  } catch (error) {
    console.error('Error setting up DB:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

setupNotificationsDB();
