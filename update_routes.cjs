const fs = require('fs');

let content = fs.readFileSync('backend/server.js', 'utf8');

// Find the evaluate block
const startMatch = content.indexOf("app.put('/api/rechecking/:id/evaluate'");

if (startMatch === -1) {
  console.log("Could not find evaluate route");
  process.exit(1);
}

// Find the end of the evaluate block
// It ends with:
//     function commitTransaction() {
//       db.commit((err) => {
//         if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
//         res.json({ success: true, message: 'Re-evaluation completed successfully' });
//       });
//     }
//   });
// });

const endStr = "res.json({ success: true, message: 'Re-evaluation completed successfully' });\n      });\n    }\n  });\n});";
let endMatch = content.indexOf(endStr, startMatch);

if (endMatch === -1) {
  // try different whitespace
  const regex = /res\.json\(\{\s*success:\s*true,\s*message:\s*'Re-evaluation completed successfully'\s*\}\);\s*}\);\s*}\s*}\);\s*}\);/;
  const match = regex.exec(content.substring(startMatch));
  if (match) {
    endMatch = startMatch + match.index + match[0].length;
  } else {
    console.log("Could not find end of evaluate route");
    process.exit(1);
  }
} else {
  endMatch += endStr.length;
}

const newRoutes = `app.put('/api/rechecking/:id/evaluate', (req, res) => {
  const reqId = req.params.id;
  const { marks, total_marks } = req.body;
  
  if (!marks || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'Invalid marks data' });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('DELETE FROM rechecking_marks WHERE request_id = ?', [reqId], (err) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

      const marksData = marks.map(m => [reqId, m.question_id, m.original_mark, m.revised_mark, m.remarks || '']);
      if (marksData.length > 0) {
        db.query(
          'INSERT INTO rechecking_marks (request_id, question_id, original_mark, revised_mark, remarks) VALUES ?',
          [marksData],
          (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
            updateStatus();
          }
        );
      } else {
        updateStatus();
      }
    });

    function updateStatus() {
      db.query(
        "UPDATE rechecking_requests SET status = 'Pending Finalization', completed_on = CURRENT_TIMESTAMP, revised_marks = ? WHERE id = ?",
        [total_marks, reqId],
        (err) => {
          if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
          commitTransaction();
        }
      );
    }
    
    function commitTransaction() {
      db.commit((err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        res.json({ success: true, message: 'Re-evaluation completed successfully' });
      });
    }
  });
});

// Finalize Re-evaluation
app.put('/api/rechecking/:id/finalize', (req, res) => {
  const reqId = req.params.id;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("SELECT answer_sheet_id, revised_marks FROM rechecking_requests WHERE id = ?", [reqId], (err, reqs) => {
      if (err || reqs.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Not found' }));
      
      const ansId = reqs[0].answer_sheet_id;
      const total_marks = reqs[0].revised_marks;
      
      db.query("UPDATE evaluation_sessions SET total_marks_awarded = ? WHERE answer_sheet_id = ?", [total_marks, ansId], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        
        db.query("SELECT id FROM evaluation_sessions WHERE answer_sheet_id = ?", [ansId], (err, sessions) => {
          if (err || sessions.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Session not found' }));
          const sessionId = sessions[0].id;
          
          db.query('SELECT question_id, revised_mark FROM rechecking_marks WHERE request_id = ?', [reqId], (err, marks) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
            
            let completedUpdates = 0;
            if (marks.length === 0) return commitTransaction();
            
            marks.forEach(m => {
              db.query(
                "UPDATE evaluation_marks SET marks_awarded = ? WHERE session_id = ? AND question_id = ?",
                [m.revised_mark, sessionId, m.question_id],
                (err) => {
                  if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                  completedUpdates++;
                  if (completedUpdates === marks.length) {
                    updateStudentResults();
                  }
                }
              );
            });
            
            function updateStudentResults() {
              db.query("SELECT student_id, paper_id FROM answer_sheets WHERE id = ?", [ansId], (err, sheets) => {
                 if (err || sheets.length === 0) return commitTransaction();
                 
                 db.query(
                    "UPDATE student_results sr JOIN result_sets rs ON sr.result_set_id = rs.id JOIN question_papers qp ON qp.academic_year = rs.academic_year AND qp.exam_type = rs.exam_type SET sr.marks_obtained = ?, sr.percentage = ( ? / qp.total_marks ) * 100 WHERE sr.student_id = ? AND qp.id = ?",
                    [total_marks, total_marks, sheets[0].student_id, sheets[0].paper_id], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                    
                    db.query("UPDATE rechecking_requests SET status = 'Completed' WHERE id = ?", [reqId], (err) => {
                      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                      commitTransaction();
                    });
                 });
              });
            }
          });
        });
      });
    });
    
    function commitTransaction() {
      db.commit((err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        res.json({ success: true, message: 'Re-evaluation finalized successfully' });
      });
    }
  });
});`;

const newContent = content.substring(0, startMatch) + newRoutes + content.substring(endMatch);
fs.writeFileSync('backend/server.js', newContent);
console.log('Updated backend routes successfully');
