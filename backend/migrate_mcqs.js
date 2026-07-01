const db = require('./db');

const addOptionsColumns = `
ALTER TABLE questions 
ADD COLUMN option_a VARCHAR(255),
ADD COLUMN option_b VARCHAR(255),
ADD COLUMN option_c VARCHAR(255),
ADD COLUMN option_d VARCHAR(255),
ADD COLUMN correct_answer VARCHAR(5),
ADD COLUMN explanation TEXT;
`;

db.query(addOptionsColumns, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ Columns already exist in questions table.');
        } else {
            console.error('❌ Error updating questions table:', err.message);
        }
    } else {
        console.log('✅ Successfully added MCQ columns to questions table.');
    }
    db.end();
});
