const db = require('./db');

const addColumns = [
    "ALTER TABLE students ADD COLUMN enrollment_number VARCHAR(50) UNIQUE;",
    "ALTER TABLE students ADD COLUMN dob DATE;",
    "ALTER TABLE students ADD COLUMN gender VARCHAR(20);",
    "ALTER TABLE students ADD COLUMN address TEXT;",
    "ALTER TABLE students ADD COLUMN admission_year INT;"
];

async function alterTable() {
    console.log("Adding profile columns to students table...");
    
    for (const query of addColumns) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err) => {
                    if (err) {
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log(`Column already exists, skipping: ${query}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log(`Success: ${query}`);
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error(`Error executing ${query}:`, error);
        }
    }
    
    console.log("Migration complete.");
    process.exit(0);
}

alterTable();
