const mysql = require('mysql2/promise');

async function alterRecheckingDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'zai827--',
      database: 'university_evaluation_system'
    });

    console.log('Connected to the database.');

    const queries = [
      "ALTER TABLE rechecking_requests ADD COLUMN return_reason TEXT DEFAULT NULL;",
      "ALTER TABLE rechecking_requests ADD COLUMN returned_by INT DEFAULT NULL;",
      "ALTER TABLE rechecking_requests ADD COLUMN returned_on DATETIME DEFAULT NULL;",
      "ALTER TABLE rechecking_requests ADD COLUMN revision_count INT DEFAULT 0;"
    ];

    for (const query of queries) {
      try {
        await connection.execute(query);
        console.log(`Executed: ${query}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${query}`);
        } else {
          console.error(`Error executing ${query}:`, err.message);
        }
      }
    }

    console.log('Database alteration completed.');

  } catch (error) {
    console.error('Error connecting to DB:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

alterRecheckingDB();
