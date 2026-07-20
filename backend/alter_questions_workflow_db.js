const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'zai827--',
  database: 'university_evaluation_system',
  multipleStatements: true
});

const queries = `
  -- Add new columns for review workflow
  ALTER TABLE questions ADD COLUMN reviewed_by INT NULL;
  ALTER TABLE questions ADD COLUMN reviewed_date DATETIME NULL;
  ALTER TABLE questions ADD COLUMN review_remarks TEXT NULL;

  -- Update existing questions to the new 'Approved' status if they were 'Active'
  UPDATE questions SET status = 'Approved' WHERE status = 'Active';
  UPDATE questions SET status = 'Archived' WHERE status = 'Inactive';
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to db:', err.message);
    process.exit(1);
  }
  console.log('Connected to db.');

  connection.query(queries, (error, results) => {
    if (error) {
      console.error('Error altering table:', error.message);
    } else {
      console.log('Successfully altered questions table for review workflow.');
    }
    connection.end();
  });
});
