const db = require('./db.js');

const tablesToClear = [
  'notifications',
  'answer_sheet_files',
  'answer_sheets',
  'rechecking_marks',
  'rechecking_requests',
  'evaluation_marks',
  'evaluation_assignments',
  'evaluation_sessions',
  'paper_questions',
  'paper_sections',
  'question_papers',
  'questions',
  'student_results',
  'result_sets',
  'students',
  'faculty',
  'subject_units',
  'subjects',
  'courses',
  'universities'
];

async function resetState() {
  try {
    console.log('Starting application reset to clean production state...');
    
    // Disable foreign key checks to allow truncating tables with foreign keys
    await new Promise((resolve, reject) => {
      db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Truncate all tables
    for (const table of tablesToClear) {
      await new Promise((resolve, reject) => {
        db.query(`TRUNCATE TABLE ${table}`, (err) => {
          if (err) {
            console.error(`Failed to truncate ${table}:`, err.message);
            resolve(); // Continue even if one fails (though it shouldn't)
          } else {
            console.log(`✅ Emptied ${table}`);
            resolve();
          }
        });
      });
    }

    // Re-enable foreign key checks
    await new Promise((resolve, reject) => {
      db.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    console.log('🎉 Reset complete! The application is now in a clean production state.');
    console.log('The users table was preserved. You can log in with your existing admin credentials.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  }
}

resetState();
