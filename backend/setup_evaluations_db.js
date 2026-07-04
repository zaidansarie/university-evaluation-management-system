const db = require('./db');

const createEvaluationSessionsTable = `
CREATE TABLE IF NOT EXISTS evaluation_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    answer_sheet_id INT,
    evaluator_id INT,
    status VARCHAR(50) DEFAULT 'Draft',
    total_marks_awarded DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    FOREIGN KEY (answer_sheet_id) REFERENCES answer_sheets(id) ON DELETE CASCADE
);
`;

const createEvaluationMarksTable = `
CREATE TABLE IF NOT EXISTS evaluation_marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    question_id INT,
    section_name VARCHAR(100),
    question_number VARCHAR(50),
    marks_awarded DECIMAL(5,2) DEFAULT 0,
    max_marks DECIMAL(5,2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY session_question (session_id, question_id)
);
`;

db.query(createEvaluationSessionsTable, (err) => {
    if (err) {
        console.error('Error creating evaluation_sessions:', err.message);
        process.exit(1);
    } else {
        console.log('✅ evaluation_sessions table ready.');
        db.query(createEvaluationMarksTable, (err) => {
            if (err) {
                console.error('Error creating evaluation_marks:', err.message);
                process.exit(1);
            } else {
                console.log('✅ evaluation_marks table ready.');
                process.exit(0);
            }
        });
    }
});
