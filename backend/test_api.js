const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createConnection({host:'localhost', user:'root', password:'zai827--', database:'university_evaluation_system'});
  try {
    const query = `
    SELECT 
        ans.id AS answer_sheet_id,
        qp.id AS paper_id,
        ans.status AS evaluation_status,
        qp.academic_year,
        qp.exam_type AS examination,
        qp.semester,
        qp.total_marks AS maximum_marks,
        sub.subject_code,
        sub.subject_name,
        f.name AS faculty_name,
        es.total_marks_awarded AS marks_obtained,
        es.last_saved_at AS evaluation_date,
        af.file_path,
        af.original_filename
    FROM answer_sheets ans
    JOIN question_papers qp ON ans.paper_id = qp.id
    JOIN subjects sub ON qp.subject_id = sub.id
    JOIN result_sets rs ON rs.paper_id = qp.id AND rs.status = 'Published'
    JOIN student_results sr ON sr.result_set_id = rs.id AND sr.student_id = ans.student_id
    LEFT JOIN evaluation_sessions es ON ans.id = es.answer_sheet_id AND es.status = 'Completed'
    LEFT JOIN faculty f ON es.evaluator_id = f.id
    LEFT JOIN answer_sheet_files af ON ans.id = af.answer_sheet_id AND af.file_type = 'Main'
    WHERE ans.student_id = 4 
    ORDER BY qp.academic_year DESC, qp.semester DESC
    `;
    const [res] = await db.query(query);
    console.log(res);
  } catch(e) {
    console.error(e);
  }
  await db.end();
}
run();
