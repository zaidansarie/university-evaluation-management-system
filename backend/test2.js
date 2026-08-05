const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost',user:'root',password:'zai827--',database:'university_evaluation_system'});
  const query = `
    SELECT 
      f.id, f.name, f.department,
      COUNT(ea.id) as assignedPapers,
      SUM(CASE WHEN ea.status = 'Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN ea.status = 'Assigned' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN ea.status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
      MAX(es.last_saved_at) as lastActivity
    FROM faculty f
    LEFT JOIN evaluation_assignments ea ON f.id = ea.faculty_id
    LEFT JOIN evaluation_sessions es ON ea.answer_sheet_id = es.answer_sheet_id AND es.evaluator_id = f.id
    WHERE f.status = 'Active'
    GROUP BY f.id
  `;
  const [rows] = await conn.query(query);
  console.log(JSON.stringify(rows.slice(0, 5), null, 2));
  await conn.end();
}
run().catch(console.error);
