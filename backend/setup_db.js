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

const createStudentsTable = `
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    course VARCHAR(50),
    program VARCHAR(100),
    school VARCHAR(100),
    semester INT,
    section VARCHAR(20),
    phone_number VARCHAR(15),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createSubjectsTable = `
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL UNIQUE,
    subject_name VARCHAR(150) NOT NULL,
    course VARCHAR(50),
    program VARCHAR(100),
    school VARCHAR(100),
    semester INT,
    credits INT,
    faculty_id INT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);
`;

db.query(createFacultyTable, (err, results) => {
  if (err) {
    console.error('❌ Error creating faculty table:', err.message);
  } else {
    console.log('✅ Faculty table created (or already exists) successfully.');
    
    db.query(createStudentsTable, (err, results) => {
      if (err) {
        console.error('❌ Error creating students table:', err.message);
      } else {
        console.log('✅ Students table created (or already exists) successfully.');
        
        db.query(createSubjectsTable, (err, results) => {
          if (err) {
            console.error('❌ Error creating subjects table:', err.message);
          } else {
            console.log('✅ Subjects table created (or already exists) successfully.');
          }
          process.exit();
        });
      }
    });
  }
});
