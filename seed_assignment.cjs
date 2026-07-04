const db = require('./backend/db.js'); 
db.query('SELECT id, status FROM answer_sheets LIMIT 1', [], (err, results) => { 
    if (err) console.error(err); 
    else { 
        if (results.length > 0) { 
            const sheetId = results[0].id; 
            db.query('INSERT INTO evaluation_assignments (answer_sheet_id, faculty_id, assignment_type, status) VALUES (?, 1, "Primary", "Assigned")', [sheetId], (err2) => { 
                if (err2) console.error(err2); 
                else { 
                    db.query('UPDATE answer_sheets SET status="Assigned" WHERE id=?', [sheetId], (err3) => { 
                        console.log("Assignment created for answer sheet", sheetId); 
                        process.exit(0); 
                    }); 
                }
            }); 
        } else { 
            console.log("No answer sheets found."); 
            process.exit(0); 
        } 
    } 
});
