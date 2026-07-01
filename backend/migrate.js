const db = require('./db');

const queries = [
  "ALTER TABLE question_papers ADD COLUMN coverage_mode VARCHAR(20) DEFAULT 'All Units'",
  "ALTER TABLE question_papers ADD COLUMN custom_units VARCHAR(255)",
  `CREATE TABLE IF NOT EXISTS paper_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    total_marks INT DEFAULT 0,
    order_num INT NOT NULL,
    FOREIGN KEY (paper_id) REFERENCES question_papers(id) ON DELETE CASCADE
  )`,
  "ALTER TABLE paper_questions ADD COLUMN section_id INT",
  "ALTER TABLE paper_questions ADD COLUMN optional_group_id INT",
  "ALTER TABLE paper_questions ADD CONSTRAINT fk_section FOREIGN KEY (section_id) REFERENCES paper_sections(id) ON DELETE CASCADE"
];

async function run() {
  for (let q of queries) {
    try {
      await new Promise((res, rej) => db.query(q, (err) => err ? rej(err) : res()));
      console.log('Success:', q.substring(0, 50) + '...');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_KEYNAME') {
        console.log('Already exists, skipping:', q.substring(0, 50) + '...');
      } else {
        console.log('Error:', e.message, 'Query:', q.substring(0, 50) + '...');
      }
    }
  }
  console.log('Migration complete.');
  process.exit();
}
run();
