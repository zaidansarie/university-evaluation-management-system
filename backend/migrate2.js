const db = require('./db');

const queries = [
  "ALTER TABLE question_papers ADD COLUMN total_marks INT DEFAULT 0",
  "ALTER TABLE question_papers ADD COLUMN num_sections INT DEFAULT 1",
  "ALTER TABLE paper_sections ADD COLUMN config JSON"
];

async function run() {
  for (let q of queries) {
    try {
      await new Promise((res, rej) => db.query(q, (err) => err ? rej(err) : res()));
      console.log('Success:', q.substring(0, 50) + '...');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Already exists, skipping:', q.substring(0, 50) + '...');
      } else {
        console.log('Error:', e.message, 'Query:', q.substring(0, 50) + '...');
      }
    }
  }
  console.log('Migration 2 complete.');
  process.exit();
}
run();
