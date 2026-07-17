const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'server.js');
let content = fs.readFileSync(file, 'utf8');

const targetAssign = `// Assign Faculty
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
});`;

const replacementAssign = `// Assign Faculty
app.put('/api/rechecking/:id/assign', (req, res) => {
  const { evaluator_id } = req.body;
  if (!evaluator_id) return res.status(400).json({ error: 'Evaluator ID is required' });

  db.query(
    \`UPDATE rechecking_requests SET evaluator_id = ?, status = 'Assigned', assigned_on = CURRENT_TIMESTAMP WHERE id = ?\`,
    [evaluator_id, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.query(\`
        SELECT rr.student_id, qp.paper_title 
        FROM rechecking_requests rr
        JOIN question_papers qp ON rr.paper_id = qp.id
        WHERE rr.id = ?
      \`, [req.params.id], (err2, results) => {
        if (!err2 && results.length > 0) {
          const { student_id, paper_title } = results[0];
          const title = 'Rechecking Assigned';
          const message = \`Your rechecking request for \${paper_title} has been assigned to a faculty evaluator.\`;
          NotificationService.createNotification(student_id, 'Rechecking Assigned', title, message, req.params.id, 'Rechecking').catch(console.error);
        }
      });

      res.json({ success: true, message: 'Request assigned successfully' });
    }
  );
});`;

const targetEvaluate = `    function commitTransaction() {
      db.commit((err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        res.json({ success: true, message: 'Re-evaluation completed successfully' });
      });
    }`;

const replacementEvaluate = `    function commitTransaction() {
      db.commit((err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
        
        db.query(\`
          SELECT rr.student_id, qp.paper_title 
          FROM rechecking_requests rr
          JOIN question_papers qp ON rr.paper_id = qp.id
          WHERE rr.id = ?
        \`, [reqId], (err2, results) => {
          if (!err2 && results.length > 0) {
            const { student_id, paper_title } = results[0];
            const title = 'Rechecking Under Final Review';
            const message = \`Your answer sheet has been re-evaluated and is awaiting final approval from the examination office.\`;
            NotificationService.createNotification(student_id, 'Rechecking Under Final Review', title, message, reqId, 'Rechecking').catch(console.error);
          }
        });

        res.json({ success: true, message: 'Re-evaluation completed successfully' });
      });
    }`;

let replacedAssign = 0;
let replacedEvaluate = 0;

if (content.includes(targetAssign)) {
  content = content.split(targetAssign).join(replacementAssign);
  replacedAssign = content.split(replacementAssign).length - 1;
}

if (content.includes(targetEvaluate)) {
  content = content.split(targetEvaluate).join(replacementEvaluate);
  replacedEvaluate = content.split(replacementEvaluate).length - 1;
}

fs.writeFileSync(file, content);
console.log('Assign Replaced:', replacedAssign);
console.log('Evaluate Replaced:', replacedEvaluate);
