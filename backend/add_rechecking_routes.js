const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverFile, 'utf8');

const routes = `
// ==========================================
// PHASE 7: RECHECKING REQUESTS
// ==========================================

// Get Dashboard Stats
app.get('/api/rechecking/dashboard-stats', (req, res) => {
  const query = \`
    SELECT 
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
      SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assignedRequests,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedRequests,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedRequests
    FROM rechecking_requests
  \`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const row = results[0];
    res.json({
      pendingRequests: row.pendingRequests || 0,
      assignedRequests: row.assignedRequests || 0,
      completedRequests: row.completedRequests || 0,
      rejectedRequests: row.rejectedRequests || 0
    });
  });
});

// Get all requests with filters
app.get('/api/rechecking', (req, res) => {
  let { academic_year, exam_type, program, course, semester, subject, status } = req.query;
  
  let query = \`
    SELECT r.*, s.name as student_name, s.roll_number, s.candidate_code,
           qp.paper_title, qp.academic_year, qp.exam_type, qp.program, qp.course, qp.semester,
           f.name as evaluator_name
    FROM rechecking_requests r
    JOIN students s ON r.student_id = s.id
    JOIN question_papers qp ON r.paper_id = qp.id
    LEFT JOIN faculty f ON r.evaluator_id = f.id
    WHERE 1=1
  \`;
  const params = [];
  
  if (academic_year) { query += \` AND qp.academic_year = ?\`; params.push(academic_year); }
  if (exam_type) { query += \` AND qp.exam_type = ?\`; params.push(exam_type); }
  if (program) { query += \` AND qp.program = ?\`; params.push(program); }
  if (course) { query += \` AND qp.course = ?\`; params.push(course); }
  if (semester) { query += \` AND qp.semester = ?\`; params.push(semester); }
  if (subject) { query += \` AND qp.paper_title LIKE ?\`; params.push(\`%\${subject}%\`); }
  if (status) { query += \` AND r.status = ?\`; params.push(status); }
  
  query += \` ORDER BY r.requested_on DESC\`;
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create Manual Request
app.post('/api/rechecking', (req, res) => {
  const { student_id, paper_id, reason, priority, remarks } = req.body;
  
  if (!student_id || !paper_id || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(\`SELECT id FROM answer_sheets WHERE student_id = ? AND paper_id = ? AND status = 'Evaluation Submitted'\`, [student_id, paper_id], (err, sheets) => {
    if (err) return res.status(500).json({ error: err.message });
    if (sheets.length === 0) return res.status(404).json({ error: 'No evaluated answer sheet found for this student and subject' });
    
    const answer_sheet_id = sheets[0].id;

    db.query(\`SELECT total_marks_awarded FROM evaluation_sessions WHERE answer_sheet_id = ?\`, [answer_sheet_id], (err, sessions) => {
      if (err) return res.status(500).json({ error: err.message });
      let original_marks = 0;
      if (sessions.length > 0 && sessions[0].total_marks_awarded != null) {
        original_marks = sessions[0].total_marks_awarded;
      }

      db.query(
        \`INSERT INTO rechecking_requests (student_id, paper_id, answer_sheet_id, reason, priority, remarks, original_marks) VALUES (?, ?, ?, ?, ?, ?, ?)\`,
        [student_id, paper_id, answer_sheet_id, reason, priority || 'Normal', remarks || '', original_marks],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: result.insertId, message: 'Rechecking request created successfully' });
        }
      );
    });
  });
});

// Assign Faculty
app.put('/api/rechecking/:id/assign', (req, res) => {
  const { evaluator_id } = req.body;
  if (!evaluator_id) return res.status(400).json({ error: 'Evaluator ID is required' });

  db.query(
    \`UPDATE rechecking_requests SET evaluator_id = ?, status = 'Assigned', assigned_on = CURRENT_TIMESTAMP WHERE id = ?\`,
    [evaluator_id, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Request assigned successfully' });
    }
  );
});

// Get Rechecking Request Details
app.get('/api/rechecking/:id', (req, res) => {
  const reqId = req.params.id;
  
  db.query(\`
    SELECT r.*, s.name as student_name, s.roll_number, s.candidate_code,
           qp.paper_title, qp.total_marks as max_marks,
           a.file_url, a.file_path, a.status as answer_sheet_status
    FROM rechecking_requests r
    JOIN students s ON r.student_id = s.id
    JOIN question_papers qp ON r.paper_id = qp.id
    JOIN answer_sheets a ON r.answer_sheet_id = a.id
    WHERE r.id = ?
  \`, [reqId], (err, requests) => {
    if (err) return res.status(500).json({ error: err.message });
    if (requests.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const requestData = requests[0];
    
    db.query('SELECT * FROM paper_questions WHERE paper_id = ? ORDER BY question_number', [requestData.paper_id], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.query(\`
        SELECT question_id, marks_awarded 
        FROM evaluation_marks em
        JOIN evaluation_sessions es ON em.session_id = es.id
        WHERE es.answer_sheet_id = ?
      \`, [requestData.answer_sheet_id], (err, marks) => {
        if (err) return res.status(500).json({ error: err.message });
        
        requestData.questions = questions.map(q => {
          const markEntry = marks.find(m => m.question_id === q.id);
          return {
            ...q,
            original_mark: markEntry ? markEntry.marks_awarded : 0
          };
        });
        
        db.query('SELECT * FROM rechecking_marks WHERE request_id = ?', [reqId], (err, rMarks) => {
          if (err) return res.status(500).json({ error: err.message });
          
          requestData.questions = requestData.questions.map(q => {
            const rMarkEntry = rMarks.find(rm => rm.question_id === q.id);
            return {
              ...q,
              revised_mark: rMarkEntry ? rMarkEntry.revised_mark : null,
              remarks: rMarkEntry ? rMarkEntry.remarks : ''
            };
          });
          
          db.query('SELECT * FROM answer_sheet_files WHERE answer_sheet_id = ?', [requestData.answer_sheet_id], (err, files) => {
            if (err) return res.status(500).json({ error: err.message });
            requestData.files = files;
            res.json(requestData);
          });
        });
      });
    });
  });
});

// Update Status (e.g., Reject)
app.put('/api/rechecking/:id/status', (req, res) => {
  const { status } = req.body;
  db.query(\`UPDATE rechecking_requests SET status = ? WHERE id = ?\`, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: \`Request status updated to \${status}\` });
  });
});

// Submit Re-evaluation
app.put('/api/rechecking/:id/evaluate', (req, res) => {
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
            updateStatusAndSession();
          }
        );
      } else {
        updateStatusAndSession();
      }
    });

    function updateStatusAndSession() {
      db.query(
        \`UPDATE rechecking_requests SET status = 'Completed', completed_on = CURRENT_TIMESTAMP, revised_marks = ? WHERE id = ?\`,
        [total_marks, reqId],
        (err) => {
          if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
          
          db.query(\`SELECT answer_sheet_id, original_marks FROM rechecking_requests WHERE id = ?\`, [reqId], (err, reqs) => {
            if (err || reqs.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Not found' }));
            
            const ansId = reqs[0].answer_sheet_id;
            
            db.query(\`UPDATE evaluation_sessions SET total_marks_awarded = ? WHERE answer_sheet_id = ?\`, [total_marks, ansId], (err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
              
              db.query(\`SELECT id FROM evaluation_sessions WHERE answer_sheet_id = ?\`, [ansId], (err, sessions) => {
                if (err || sessions.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Session not found' }));
                const sessionId = sessions[0].id;
                
                let completedUpdates = 0;
                if (marks.length === 0) return commitTransaction();
                
                marks.forEach(m => {
                  db.query(
                    \`UPDATE evaluation_marks SET marks_awarded = ? WHERE session_id = ? AND question_id = ?\`,
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
                  db.query(\`SELECT student_id, paper_id FROM answer_sheets WHERE id = ?\`, [ansId], (err, sheets) => {
                     if (err || sheets.length === 0) return commitTransaction();
                     
                     db.query(\`
                        UPDATE student_results sr
                        JOIN result_sets rs ON sr.result_set_id = rs.id
                        JOIN question_papers qp ON qp.academic_year = rs.academic_year AND qp.exam_type = rs.exam_type
                        SET sr.marks_obtained = ?, sr.percentage = ( ? / qp.total_marks ) * 100
                        WHERE sr.student_id = ? AND qp.id = ?
                     \`, [total_marks, total_marks, sheets[0].student_id, sheets[0].paper_id], (err) => {
                        commitTransaction();
                     });
                  });
                }
              });
            });
          });
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

// Start the server
`;

content = content.replace('// Start the server\r\n', routes);
content = content.replace('// Start the server\n', routes);

fs.writeFileSync(serverFile, content, 'utf8');
console.log('Routes added successfully.');
