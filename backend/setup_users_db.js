const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('Creating users table...');

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    plain_password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    university_id INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL
  )
`;

db.query(createTableQuery, async (err) => {
  if (err) {
    console.error('Error creating users table', err.message);
    process.exit(1);
  } else {
    console.log('Users table created successfully.');
    
    // Check if superadmin already exists
    db.query('SELECT id FROM users WHERE email = ?', ['superadmin@uems.com'], async (err, results) => {
      if (err) {
        console.error('Error checking for superadmin:', err.message);
        process.exit(1);
      }
      
      if (results.length > 0) {
        console.log('Super Admin already exists. Skipping insertion.');
        process.exit();
      } else {
        // Create superadmin
        try {
          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash('SuperAdmin@123', salt);
          
          const insertQuery = `
            INSERT INTO users (name, username, email, password_hash, plain_password, role, university_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          const values = ['Platform Owner', 'superadmin', 'superadmin@uems.com', password_hash, 'SuperAdmin@123', 'super-admin', null];
          
          db.query(insertQuery, values, (err) => {
            if (err) {
              console.error('Error inserting superadmin:', err.message);
            } else {
              console.log('Successfully inserted default Super Admin record.');
            }
            process.exit();
          });
        } catch (error) {
          console.error('Error hashing password:', error);
          process.exit(1);
        }
      }
    });
  }
});
