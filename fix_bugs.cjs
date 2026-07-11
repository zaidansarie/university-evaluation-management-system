const fs = require('fs');

let content = fs.readFileSync('backend/server.js', 'utf8');

// Fix 1: Remove a.file_url, a.file_path
content = content.replace(/a\.file_url,\s*a\.file_path,\s*a\.status\s*as\s*answer_sheet_status/g, 'a.status as answer_sheet_status');

// Fix 2: Prevent duplicate requests
const originalPostStr = `    const answer_sheet_id = sheets[0].id;

    db.query(\`SELECT total_marks_awarded FROM evaluation_sessions WHERE answer_sheet_id = ?\`, [answer_sheet_id], (err, sessions) => {
      if (err) return res.status(500).json({ error: err.message });`;

const newPostStr = `    const answer_sheet_id = sheets[0].id;
    
    db.query(\`SELECT id FROM rechecking_requests WHERE answer_sheet_id = ? AND status IN ('Pending', 'Assigned', 'Pending Finalization')\`, [answer_sheet_id], (err, activeRequests) => {
      if (err) return res.status(500).json({ error: err.message });
      if (activeRequests.length > 0) return res.status(400).json({ error: 'An active rechecking request already exists for this subject' });

    db.query(\`SELECT total_marks_awarded FROM evaluation_sessions WHERE answer_sheet_id = ?\`, [answer_sheet_id], (err, sessions) => {
      if (err) return res.status(500).json({ error: err.message });`;

// I also need to close the `db.query` callback!
const originalEndStr = `          res.status(201).json({ id: result.insertId, message: 'Rechecking request created successfully' });
        }
      );
    });
  });
});`;

const newEndStr = `          res.status(201).json({ id: result.insertId, message: 'Rechecking request created successfully' });
        }
      );
    });
    }); // Close the active requests query
  });
});`;

content = content.replace(new RegExp(originalPostStr.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), newPostStr);
content = content.replace(new RegExp(originalEndStr.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), newEndStr);

fs.writeFileSync('backend/server.js', content);
console.log('Fixed server.js bugs');
