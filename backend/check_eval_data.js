const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createConnection({host:'localhost', user:'root', password:'zai827--', database:'university_evaluation_system'});
  const [sessions] = await db.query("SELECT * FROM evaluation_sessions");
  console.log('Evaluation Sessions:', sessions);
  const [marks] = await db.query("SELECT * FROM evaluation_marks");
  console.log('Evaluation Marks:', marks);
  await db.end();
}
run();
