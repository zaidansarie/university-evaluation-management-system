const db = require('./db');

const createAnswerSheetsTable = `
CREATE TABLE IF NOT EXISTS answer_sheets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    paper_id INT,
    candidate_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

const createAnswerSheetFilesTable = `
CREATE TABLE IF NOT EXISTS answer_sheet_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    answer_sheet_id INT,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_type VARCHAR(50) DEFAULT 'Main',
    uploaded_by VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_sheet_id) REFERENCES answer_sheets(id) ON DELETE CASCADE
);
`;

const createEvaluationAssignmentsTable = `
CREATE TABLE IF NOT EXISTS evaluation_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    answer_sheet_id INT,
    faculty_id INT,
    assignment_type VARCHAR(50) DEFAULT 'Primary',
    status VARCHAR(50) DEFAULT 'Assigned',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_sheet_id) REFERENCES answer_sheets(id) ON DELETE CASCADE
);
`;

db.query(createAnswerSheetsTable, (err) => {
    if (err) console.error('Error creating answer_sheets:', err.message);
    else {
        console.log('✅ answer_sheets table ready.');
        db.query(createAnswerSheetFilesTable, (err) => {
            if (err) console.error('Error creating answer_sheet_files:', err.message);
            else {
                console.log('✅ answer_sheet_files table ready.');
                db.query(createEvaluationAssignmentsTable, (err) => {
                    if (err) console.error('Error creating evaluation_assignments:', err.message);
                    else {
                        console.log('✅ evaluation_assignments table ready.');
                        process.exit();
                    }
                });
            }
        });
    }
});
