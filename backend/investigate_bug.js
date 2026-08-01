const mysql = require('mysql2');
const conn = mysql.createConnection({host:'localhost',user:'root',password:'zai827--',database:'university_evaluation_system'});

console.log("=== 1. Verify the assignment record ===");
conn.query("SELECT id as assignment_id, answer_sheet_id, faculty_id, status, assigned_date as assigned_at FROM evaluation_assignments ORDER BY id DESC LIMIT 1", (err, assignments) => {
  console.log(assignments[0]);
  
  console.log("\n=== 2. Verify the logged-in faculty (Meera Nair in Users) ===");
  conn.query("SELECT id as user_id, email, role, name FROM users WHERE name LIKE '%Meera Nair%' OR email LIKE '%meera%' LIMIT 1", (err, users) => {
    console.log(users[0]);
    
    console.log("\n=== 6. Compare IDs ===");
    console.log("Logged-in faculty (users table): id = " + users[0].user_id);
    console.log("Assignment table: faculty_id = " + assignments[0].faculty_id);
    
    conn.query("SELECT id FROM faculty WHERE email = ?", [users[0].email], (err, fac) => {
      console.log("Faculty table: id = " + (fac[0] ? fac[0].id : 'Not Found'));
      
      console.log("\n=== 7. Root Cause ===");
      console.log("The login endpoint returns the primary key from the 'users' table (167).");
      console.log("However, the admin assigns evaluations using the primary key from the 'faculty' table (2).");
      console.log("The frontend Faculty Portal makes requests like /api/evaluations/assigned?faculty_id=167.");
      console.log("Because 167 (user ID) != 2 (faculty ID), the SQL query returns 0 rows.");
      
      process.exit();
    });
  });
});
