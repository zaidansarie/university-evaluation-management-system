const db = require('./backend/db.js');

async function trace() {
  const util = require('util');
  const query = util.promisify(db.query).bind(db);

  try {
    const students = await query("SELECT id, name, roll_number FROM students WHERE name LIKE '%Suhana Bose%'");
    console.log("Students:", students);
    
    if (students.length === 0) return;
    const student_id = students[0].id;

    const papers = await query("SELECT id, paper_title, exam_type, academic_year FROM question_papers WHERE paper_title LIKE '%Database Management System%'");
    console.log("Papers:", papers);
    
    if (papers.length === 0) return;
    const paper_id = papers[0].id;

    console.log(`\nChecking answer sheets for student_id=${student_id}, paper_id=${paper_id}...`);
    const sheets = await query("SELECT * FROM answer_sheets WHERE student_id = ? AND paper_id = ?", [student_id, paper_id]);
    console.log("Answer Sheets matching exact student and paper:", sheets);

    console.log(`\nChecking all answer sheets for paper_id=${paper_id}...`);
    const allSheetsForPaper = await query("SELECT * FROM answer_sheets WHERE paper_id = ?", [paper_id]);
    console.log("All Answer Sheets for paper:", allSheetsForPaper);

    const allSheetsForStudent = await query("SELECT * FROM answer_sheets WHERE student_id = ?", [student_id]);
    console.log("All Answer Sheets for student:", allSheetsForStudent);

    console.log(`\nChecking evaluation sessions for paper_id=${paper_id}...`);
    const evaluations = await query(`
      SELECT es.*, asht.student_id, asht.paper_id, asht.status 
      FROM evaluation_sessions es 
      JOIN answer_sheets asht ON es.answer_sheet_id = asht.id 
      WHERE asht.paper_id = ?
    `, [paper_id]);
    console.log("Evaluations for paper:", evaluations);
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
trace();
