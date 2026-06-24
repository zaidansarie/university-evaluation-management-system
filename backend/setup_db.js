const db = require('./db');

const createFacultyTable = `
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(createFacultyTable, (err, results) => {
  if (err) {
    console.error('❌ Error creating faculty table:', err.message);
  } else {
    console.log('✅ Faculty table created (or already exists) successfully.');
  }
  process.exit();
});
