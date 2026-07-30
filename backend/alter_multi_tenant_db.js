const db = require('./db');

const tablesToAlter = [
  'students',
  'faculty',
  'subjects',
  'evaluations',
  'results',
  'notifications',
  'answer_sheets',
  'question_papers',
  'questions',
  'rechecking_requests'
];

async function alterTables() {
  console.log('Starting multi-tenant database alterations...');
  
  for (const table of tablesToAlter) {
    try {
      // Check if table exists
      const tableExists = await new Promise((resolve) => {
        db.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
          if (err) resolve(false);
          resolve(results.length > 0);
        });
      });

      if (!tableExists) {
        console.log(`Table '${table}' does not exist, skipping.`);
        continue;
      }

      // Check if column exists
      const columnExists = await new Promise((resolve) => {
        db.query(`SHOW COLUMNS FROM ${table} LIKE 'university_id'`, (err, results) => {
          if (err) resolve(false);
          resolve(results.length > 0);
        });
      });

      if (!columnExists) {
        console.log(`Adding university_id to ${table}...`);
        await new Promise((resolve, reject) => {
          // Add column and foreign key
          const alterQuery = `
            ALTER TABLE ${table}
            ADD COLUMN university_id INT DEFAULT NULL,
            ADD CONSTRAINT fk_${table}_university_id FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
          `;
          db.query(alterQuery, (err, results) => {
            if (err) {
              console.error(`Error altering table ${table} with foreign key:`, err.message);
              // Fallback without foreign key if there's a constraint issue due to existing data
              const fallbackQuery = `ALTER TABLE ${table} ADD COLUMN university_id INT DEFAULT NULL`;
              db.query(fallbackQuery, (err2) => {
                if (err2) {
                  reject(err2);
                } else {
                  console.log(`Added university_id to ${table} (without foreign key due to existing data/constraints).`);
                  resolve();
                }
              });
            } else {
              console.log(`Successfully added university_id to ${table}.`);
              resolve();
            }
          });
        });
      } else {
        console.log(`Table '${table}' already has university_id column.`);
      }
    } catch (error) {
      console.error(`Failed to process table ${table}:`, error.message);
    }
  }

  console.log('Multi-tenant database alterations completed.');
  process.exit(0);
}

alterTables();
