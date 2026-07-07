const db = require('./db');

const createResultSetsTable = `
CREATE TABLE IF NOT EXISTS result_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    course VARCHAR(50),
    program VARCHAR(100),
    semester INT,
    section VARCHAR(20),
    total_students INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Generated',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);
`;

const createStudentResultsTable = `
CREATE TABLE IF NOT EXISTS student_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    result_set_id INT,
    student_id INT,
    roll_number VARCHAR(50),
    candidate_code VARCHAR(100),
    student_name VARCHAR(100),
    subjects_evaluated INT DEFAULT 0,
    total_marks DECIMAL(10,2) DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pass',
    FOREIGN KEY (result_set_id) REFERENCES result_sets(id) ON DELETE CASCADE
);
`;

db.query(createResultSetsTable, (err) => {
    if (err) {
        console.error('Error creating result_sets:', err.message);
        process.exit(1);
    } else {
        console.log('✅ result_sets table ready.');
        db.query(createStudentResultsTable, (err) => {
            if (err) {
                console.error('Error creating student_results:', err.message);
                process.exit(1);
            } else {
                console.log('✅ student_results table ready.');
                process.exit(0);
            }
        });
    }
});
