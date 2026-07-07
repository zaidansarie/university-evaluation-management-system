const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OCRService = require('./services/ocr/OCRService'); // Add OCR Service

// Import the database connection (this will also test the connection when server starts)
const db = require('./db');

// Initialize the Express application
const app = express();

// Middleware setup
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// Serve uploaded files statically
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'examination-answer-sheets');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_'));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// A simple test route to verify the server is working
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// --- COURSES API ROUTES ---
app.get('/api/students/search', (req, res) => {
  const { q, course, semester, program } = req.query;
  
  let conditions = [];
  let params = [];
  
  if (course) {
    conditions.push('course = ?');
    params.push(course);
  }
  if (semester) {
    conditions.push('semester = ?');
    params.push(semester);
  }
  if (program) {
    conditions.push('program = ?');
    params.push(program);
  }
  
  if (!q) {
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT id, name, roll_number, candidate_code, program, course, semester 
      FROM students 
      ${whereClause}
      LIMIT 100
    `;
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
    return;
  }
  
  let searchCondition = '(name LIKE ? OR roll_number LIKE ? OR candidate_code LIKE ?)';
  conditions.push(searchCondition);
  const likeQ = `%${q}%`;
  params.push(likeQ, likeQ, likeQ);
  
  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  
  const query = `
    SELECT id, name, roll_number, candidate_code, program, course, semester 
    FROM students 
    ${whereClause}
    LIMIT 20
  `;
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.get('/api/courses', (req, res) => {
  db.query('SELECT * FROM courses WHERE status = "Active"', (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// --- FACULTY API ROUTES ---

// 1. Get All Faculty
app.get('/api/faculty', (req, res) => {
  const query = 'SELECT * FROM faculty';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching faculty:', err);
      return res.status(500).json({ error: 'Database error fetching faculty' });
    }
    res.json(results);
  });
});

// 2. Add New Faculty
app.post('/api/faculty', (req, res) => {
  // Get data sent from the frontend
  const { name, email, department, phone_number, status } = req.body;
  
  // Prepare the SQL query (using ? prevents SQL injection)
  const query = 'INSERT INTO faculty (name, email, department, phone_number, status) VALUES (?, ?, ?, ?, ?)';
  
  // Set default status to 'Active' if none is provided
  const facultyStatus = status || 'Active';
  
  db.query(query, [name, email, department, phone_number, facultyStatus], (err, results) => {
    if (err) {
      console.error('Error adding faculty:', err);
      return res.status(500).json({ error: 'Failed to add faculty' });
    }
    res.status(201).json({ message: 'Faculty added successfully!', id: results.insertId });
  });
});

// 3. Delete Faculty
app.delete('/api/faculty/:id', (req, res) => {
  const facultyId = req.params.id; // Get the ID from the URL
  const query = 'DELETE FROM faculty WHERE id = ?';
  
  db.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error('Error deleting faculty:', err);
      return res.status(500).json({ error: 'Failed to delete faculty' });
    }
    // If no rows were affected, the faculty member wasn't found
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ message: 'Faculty deleted successfully!' });
  });
});

// --- STUDENT API ROUTES ---

// 1. Get All Students
app.get('/api/students', (req, res) => {
  const query = 'SELECT * FROM students';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ error: 'Database error fetching students' });
    }
    res.json(results);
  });
});

// 2. Add New Student
app.post('/api/students', (req, res) => {
  const { roll_number, name, email, course, program, school, semester, section, phone_number, status } = req.body;
  
  const query = 'INSERT INTO students (roll_number, name, email, course, program, school, semester, section, phone_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  const studentStatus = status || 'Active';
  
  db.query(query, [roll_number, name, email, course, program, school, semester, section, phone_number, studentStatus], (err, results) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).json({ error: 'Failed to add student' });
    }
    res.status(201).json({ message: 'Student added successfully!', id: results.insertId });
  });
});

// 3. Update Student
app.put('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const { roll_number, name, email, course, program, school, semester, section, phone_number, status } = req.body;

  const query = 'UPDATE students SET roll_number = ?, name = ?, email = ?, course = ?, program = ?, school = ?, semester = ?, section = ?, phone_number = ?, status = ? WHERE id = ?';
  
  db.query(query, [roll_number, name, email, course, program, school, semester, section, phone_number, status, studentId], (err, results) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).json({ error: 'Failed to update student' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully!' });
  });
});

// 4. Delete Student
app.delete('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const query = 'DELETE FROM students WHERE id = ?';
  
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully!' });
  });
});

// --- SUBJECT API ROUTES ---

// 1. Get All Subjects (with faculty name and units)
app.get('/api/subjects', (req, res) => {
  const query = `
    SELECT subjects.*, faculty.name AS assigned_faculty_name 
    FROM subjects 
    LEFT JOIN faculty ON subjects.faculty_id = faculty.id
  `;
  db.query(query, (err, subjects) => {
    if (err) {
      console.error('Error fetching subjects:', err);
      return res.status(500).json({ error: 'Database error fetching subjects' });
    }
    
    const unitsQuery = 'SELECT * FROM subject_units ORDER BY unit_number ASC';
    db.query(unitsQuery, (err, units) => {
      if (err) {
        console.error('Error fetching subject units:', err);
        return res.status(500).json({ error: 'Database error fetching units' });
      }
      
      const subjectsWithUnits = subjects.map(subject => ({
        ...subject,
        units: units.filter(u => u.subject_id === subject.id)
      }));
      
      res.json(subjectsWithUnits);
    });
  });
});

// 2. Add New Subject
app.post('/api/subjects', (req, res) => {
  const { subject_code, subject_name, course, program, school, semester, credits, faculty_id, status, units } = req.body;
  
  const query = 'INSERT INTO subjects (subject_code, subject_name, course, program, school, semester, credits, faculty_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const subjectStatus = status || 'Active';
  
  db.query(query, [subject_code, subject_name, course, program, school, semester, credits, faculty_id, subjectStatus], (err, results) => {
    if (err) {
      console.error('Error adding subject:', err);
      return res.status(500).json({ error: 'Failed to add subject' });
    }
    
    const subjectId = results.insertId;
    
    if (units && units.length > 0) {
      const unitValues = units.map((u, index) => [subjectId, index + 1, u.unit_name]);
      const unitQuery = 'INSERT INTO subject_units (subject_id, unit_number, unit_name) VALUES ?';
      db.query(unitQuery, [unitValues], (err) => {
        if (err) console.error('Error inserting units:', err);
        return res.status(201).json({ message: 'Subject and units added successfully!', id: subjectId });
      });
    } else {
      res.status(201).json({ message: 'Subject added successfully!', id: subjectId });
    }
  });
});

// 3. Update Subject
app.put('/api/subjects/:id', (req, res) => {
  const subjectId = req.params.id;
  const { subject_code, subject_name, course, program, school, semester, credits, faculty_id, status, units } = req.body;

  const query = 'UPDATE subjects SET subject_code = ?, subject_name = ?, course = ?, program = ?, school = ?, semester = ?, credits = ?, faculty_id = ?, status = ? WHERE id = ?';
  
  db.query(query, [subject_code, subject_name, course, program, school, semester, credits, faculty_id, status, subjectId], (err, results) => {
    if (err) {
      console.error('Error updating subject:', err);
      return res.status(500).json({ error: 'Failed to update subject' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Replace all units
    db.query('DELETE FROM subject_units WHERE subject_id = ?', [subjectId], (err) => {
      if (err) console.error('Error deleting old units:', err);
      
      if (units && units.length > 0) {
        const unitValues = units.map((u, index) => [subjectId, index + 1, u.unit_name]);
        const unitQuery = 'INSERT INTO subject_units (subject_id, unit_number, unit_name) VALUES ?';
        db.query(unitQuery, [unitValues], (err) => {
          if (err) console.error('Error inserting units:', err);
          return res.json({ message: 'Subject and units updated successfully!' });
        });
      } else {
        res.json({ message: 'Subject updated successfully!' });
      }
    });
  });
});

// 4. Delete Subject
app.delete('/api/subjects/:id', (req, res) => {
  const subjectId = req.params.id;
  const query = 'DELETE FROM subjects WHERE id = ?';
  
  // NOTE: subject_units will be deleted automatically because of ON DELETE CASCADE
  db.query(query, [subjectId], (err, results) => {
    if (err) {
      console.error('Error deleting subject:', err);
      return res.status(500).json({ error: 'Failed to delete subject' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully!' });
  });
});

// --- QUESTION BANK API ROUTES ---

// 1. Get All Questions (with subject name and faculty name)
app.get('/api/questions', (req, res) => {
  const query = `
    SELECT questions.*, subjects.subject_name, faculty.name AS creator_name
    FROM questions
    LEFT JOIN subjects ON questions.subject_id = subjects.id
    LEFT JOIN faculty ON questions.created_by = faculty.id
    ORDER BY questions.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Database error fetching questions' });
    }
    res.json(results);
  });
});

// 2. Add New Question
app.post('/api/questions', (req, res) => {
  const { question_code, subject_id, unit, question_text, question_type, blooms_level, difficulty_level, marks, status, created_by, option_a, option_b, option_c, option_d, correct_answer, explanation } = req.body;
  
  const query = 'INSERT INTO questions (question_code, subject_id, unit, question_text, question_type, blooms_level, difficulty_level, marks, status, created_by, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  const questionStatus = status || 'Active';
  
  db.query(query, [question_code, subject_id, unit, question_text, question_type, blooms_level, difficulty_level, marks, questionStatus, created_by, option_a, option_b, option_c, option_d, correct_answer, explanation], (err, results) => {
    if (err) {
      console.error('Error adding question:', err);
      return res.status(500).json({ error: 'Database error adding question' });
    }
    res.status(201).json({ message: 'Question added successfully!', id: results.insertId });
  });
});

// Bulk Create Questions
app.post('/api/questions/bulk', (req, res) => {
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'No questions provided' });
  }

  const query = 'INSERT INTO questions (question_code, subject_id, unit, question_text, question_type, blooms_level, difficulty_level, marks, status, created_by, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES ?';
  const values = questions.map(q => [
    q.question_code, q.subject_id, q.unit, q.question_text, q.question_type, 
    q.blooms_level, q.difficulty_level, q.marks, q.status || 'Active', q.created_by || null,
    q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation
  ]);

  db.query(query, [values], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'One or more question codes already exist.' });
      }
      console.error('Error adding bulk questions:', err);
      return res.status(500).json({ error: 'Failed to add bulk questions' });
    }
    res.status(201).json({ message: 'Questions added successfully!', count: results.affectedRows });
  });
});

// 3. Update Question
app.put('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const { question_code, subject_id, unit, question_text, question_type, blooms_level, difficulty_level, marks, status, created_by, option_a, option_b, option_c, option_d, correct_answer, explanation } = req.body;

  const query = 'UPDATE questions SET question_code = ?, subject_id = ?, unit = ?, question_text = ?, question_type = ?, blooms_level = ?, difficulty_level = ?, marks = ?, status = ?, created_by = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, explanation = ? WHERE id = ?';
  
  db.query(query, [question_code, subject_id, unit, question_text, question_type, blooms_level, difficulty_level, marks, status, created_by, option_a, option_b, option_c, option_d, correct_answer, explanation, questionId], (err, results) => {
    if (err) {
      console.error('Error updating question:', err);
      return res.status(500).json({ error: 'Failed to update question' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question updated successfully!' });
  });
});

// 4. Delete Question
app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const query = 'DELETE FROM questions WHERE id = ?';
  
  db.query(query, [questionId], (err, results) => {
    if (err) {
      console.error('Error deleting question:', err);
      return res.status(500).json({ error: 'Failed to delete question' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully!' });
  });
});

// --- QUESTION PAPER API ROUTES ---

// 1. Get All Question Papers
app.get('/api/question-papers', (req, res) => {
  const query = `
    SELECT qp.*, s.subject_name, s.subject_code, s.semester, s.course, s.program, f.name AS creator_name
    FROM question_papers qp
    LEFT JOIN subjects s ON qp.subject_id = s.id
    LEFT JOIN faculty f ON qp.created_by = f.id
    ORDER BY qp.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching question papers:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/question-papers/:id', (req, res) => {
  const query = `
    SELECT qp.*, s.subject_name, s.subject_code, s.semester, s.course, s.program, f.name AS creator_name
    FROM question_papers qp
    LEFT JOIN subjects s ON qp.subject_id = s.id
    LEFT JOIN faculty f ON qp.created_by = f.id
    WHERE qp.id = ?
  `;
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Question paper not found' });
    res.json(results[0]);
  });
});

app.get('/api/examinations/directory', (req, res) => {
  const query = `
    SELECT 
      qp.id, qp.paper_title, qp.exam_type, qp.academic_year, qp.status,
      s.subject_name, s.subject_code, s.course, s.program, s.semester,
      COUNT(ans.id) as total_uploaded,
      SUM(CASE WHEN ans.status != 'Uploaded - Needs Linking' THEN 1 ELSE 0 END) as linked,
      SUM(CASE WHEN ans.status = 'Uploaded - Needs Linking' THEN 1 ELSE 0 END) as pending_linking,
      SUM(CASE WHEN ans.status = 'Assigned' THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN ans.status = 'Under Evaluation' THEN 1 ELSE 0 END) as under_evaluation,
      SUM(CASE WHEN ans.status = 'Moderation' THEN 1 ELSE 0 END) as moderation,
      SUM(CASE WHEN ans.status = 'Rechecking' THEN 1 ELSE 0 END) as rechecking,
      SUM(CASE WHEN ans.status = 'Completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN ans.status = 'Locked' THEN 1 ELSE 0 END) as locked
    FROM question_papers qp
    LEFT JOIN subjects s ON qp.subject_id = s.id
    LEFT JOIN answer_sheets ans ON qp.id = ans.paper_id
    WHERE qp.status = 'Active' OR qp.status = 'Published'
    GROUP BY qp.id
    ORDER BY qp.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching examinations directory:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    // Ensure numbers instead of strings for counts (mysql sum returns strings sometimes)
    const formattedResults = results.map(row => ({
      ...row,
      total_uploaded: Number(row.total_uploaded) || 0,
      linked: Number(row.linked) || 0,
      pending_linking: Number(row.pending_linking) || 0,
      assigned: Number(row.assigned) || 0,
      under_evaluation: Number(row.under_evaluation) || 0,
      moderation: Number(row.moderation) || 0,
      rechecking: Number(row.rechecking) || 0,
      completed: Number(row.completed) || 0,
      locked: Number(row.locked) || 0
    }));
    res.json(formattedResults);
  });
});


// 2. Add New Question Paper
app.post('/api/question-papers', (req, res) => {
  const { academic_year, exam_type, course, program, school, subject_id, semester, paper_title, status, created_by, coverage_mode, custom_units, total_marks, num_sections } = req.body;
  
  const query = 'INSERT INTO question_papers (academic_year, exam_type, course, program, school, subject_id, semester, paper_title, status, created_by, coverage_mode, custom_units, total_marks, num_sections) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const paperStatus = status || 'Active';
  const customUnitsString = custom_units ? JSON.stringify(custom_units) : null;
  
  db.query(query, [academic_year, exam_type, course, program, school, subject_id, semester, paper_title, paperStatus, created_by, coverage_mode || 'All Units', customUnitsString, total_marks || 0, num_sections || 1], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A question paper for this Subject, Exam Type, Semester, and Academic Year already exists.' });
      }
      console.error('Error adding question paper:', err);
      return res.status(500).json({ error: 'Failed to add question paper' });
    }
    
    const paperId = results.insertId;
    const nSections = num_sections ? parseInt(num_sections) : 1;
    
    if (nSections > 0) {
      let values = [];
      for(let i=0; i<nSections; i++) {
        values.push([paperId, `Section ${String.fromCharCode(65 + i)}`, '', 0, i+1]);
      }
      db.query('INSERT INTO paper_sections (paper_id, name, description, total_marks, order_num) VALUES ?', [values], (err2) => {
        if(err2) console.error('Error adding default sections:', err2);
        res.status(201).json({ message: 'Question paper added successfully!', id: paperId });
      });
    } else {
      res.status(201).json({ message: 'Question paper added successfully!', id: paperId });
    }
  });
});

// 3. Update Question Paper
app.put('/api/question-papers/:id', (req, res) => {
  const paperId = req.params.id;
  const { academic_year, exam_type, course, program, school, subject_id, semester, paper_title, status, created_by, coverage_mode, custom_units, total_marks, num_sections } = req.body;

  const query = 'UPDATE question_papers SET academic_year = ?, exam_type = ?, course = ?, program = ?, school = ?, subject_id = ?, semester = ?, paper_title = ?, status = ?, created_by = ?, coverage_mode = ?, custom_units = ?, total_marks = ?, num_sections = ? WHERE id = ?';
  const customUnitsString = custom_units ? JSON.stringify(custom_units) : null;
  
  db.query(query, [academic_year, exam_type, course, program, school, subject_id, semester, paper_title, status, created_by, coverage_mode || 'All Units', customUnitsString, total_marks || 0, num_sections || 1, paperId], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A question paper for this Subject, Exam Type, Semester, and Academic Year already exists.' });
      }
      console.error('Error updating question paper:', err);
      return res.status(500).json({ error: 'Failed to update question paper' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Question paper not found' });
    }
    res.json({ message: 'Question paper updated successfully!' });
  });
});

// 4. Delete Question Paper
app.delete('/api/question-papers/:id', (req, res) => {
  const paperId = req.params.id;
  const query = 'DELETE FROM question_papers WHERE id = ?';
  
  db.query(query, [paperId], (err, results) => {
    if (err) {
      console.error('Error deleting question paper:', err);
      return res.status(500).json({ error: 'Failed to delete question paper' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Question paper not found' });
    }
    res.json({ message: 'Question paper deleted successfully!' });
  });
});

// --- ADVANCED QUESTION PAPER BUILDER API ROUTES ---

// 1. Get Available Questions (with history & custom units filtered)
app.get('/api/question-papers/:id/available-questions', (req, res) => {
  const paperId = req.params.id;
  
  db.query('SELECT * FROM question_papers WHERE id = ?', [paperId], (err, paperResults) => {
    if (err || paperResults.length === 0) return res.status(500).json({ error: 'Paper not found' });
    const paper = paperResults[0];
    
    db.query('SELECT * FROM questions WHERE subject_id = ? AND status = "Active"', [paper.subject_id], (err, questions) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      let filteredQuestions = questions;
      if (paper.coverage_mode === 'Custom Units' && paper.custom_units) {
        let units;
        try { units = JSON.parse(paper.custom_units); } catch(e) { units = []; }
        if (units && units.length > 0) {
          // unit_name in question might be stored in 'unit' column as string e.g., 'Introduction' or number '1'
          // We need to match whatever is stored. Assuming q.unit matches u.unit_name.
          // Wait, 'custom_units' array stores unit names (from formData.custom_units)
          filteredQuestions = questions.filter(q => units.includes(q.unit));
        }
      }
      
      const qIds = filteredQuestions.map(q => q.id);
      if (qIds.length === 0) return res.json([]);
      
      const historyQuery = `
        SELECT pq.question_id, qp.exam_type, qp.academic_year 
        FROM paper_questions pq 
        JOIN question_papers qp ON pq.paper_id = qp.id 
        WHERE pq.question_id IN (?) AND pq.paper_id != ?
      `;
      db.query(historyQuery, [qIds, paperId], (err, historyResults) => {
        if (err) return res.status(500).json({ error: 'DB error history' });
        
        const historyMap = {};
        historyResults.forEach(row => {
          if (!historyMap[row.question_id]) historyMap[row.question_id] = [];
          historyMap[row.question_id].push(`Used in ${row.exam_type} ${row.academic_year}`);
        });
        
        const result = filteredQuestions.map(q => ({
          ...q,
          history: historyMap[q.id] || []
        }));
        
        res.json(result);
      });
    });
  });
});

// 2. Get Builder Data (Sections & mapped questions)
app.get('/api/question-papers/:id/builder-data', (req, res) => {
  const paperId = req.params.id;
  db.query('SELECT * FROM paper_sections WHERE paper_id = ? ORDER BY order_num ASC', [paperId], (err, sections) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    
    const query = `
      SELECT q.*, pq.order_num, pq.section_id, pq.optional_group_id
      FROM paper_questions pq
      JOIN questions q ON pq.question_id = q.id
      WHERE pq.paper_id = ?
      ORDER BY pq.section_id ASC, pq.order_num ASC
    `;
    db.query(query, [paperId], (err, questions) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ sections, paperQuestions: questions });
    });
  });
});

// 3. Save Builder Data
app.post('/api/question-papers/:id/builder-data', (req, res) => {
  const paperId = req.params.id;
  const { sections, paperQuestions } = req.body;
  
  db.query('DELETE FROM paper_sections WHERE paper_id = ?', [paperId], (err) => {
    if (err) return res.status(500).json({ error: 'Error clearing sections' });
    db.query('DELETE FROM paper_questions WHERE paper_id = ?', [paperId], (err) => {
      
      if (!sections || sections.length === 0) return res.json({ message: 'Saved successfully' });
      
      let newSectionIdMap = {};
      let sectionsCompleted = 0;
      
      sections.forEach((sec, i) => {
        const configStr = sec.config ? JSON.stringify(sec.config) : null;
        db.query('INSERT INTO paper_sections (paper_id, name, description, total_marks, order_num, config) VALUES (?, ?, ?, ?, ?, ?)', 
        [paperId, sec.name, sec.description || '', sec.total_marks || 0, i+1, configStr], 
        (err, results) => {
          if (!err) newSectionIdMap[sec.client_id] = results.insertId;
          sectionsCompleted++;
          
          if (sectionsCompleted === sections.length) {
            if (!paperQuestions || paperQuestions.length === 0) return res.json({ message: 'Saved successfully' });
            
            const values = paperQuestions.map((q, qIndex) => {
               const dbSectionId = newSectionIdMap[q.section_client_id] || null;
               return [paperId, dbSectionId, q.question_id, qIndex + 1, q.optional_group_id || null];
            });
            
            db.query('INSERT INTO paper_questions (paper_id, section_id, question_id, order_num, optional_group_id) VALUES ?', [values], (err) => {
              if (err) return res.status(500).json({ error: 'Error saving questions' });
              res.json({ message: 'Saved successfully' });
            });
          }
        });
      });
    });
  });
});

// 4. Generate Entire Paper (Blueprint Mode)
app.post('/api/question-papers/:id/generate-full', (req, res) => {
  const paperId = req.params.id;
  const { sections, availableQuestions } = req.body;
  // sections: [{ client_id, name, config: { total_marks, question_type, num_questions, marks_per_question, diffDist, bloomDist, internal_choice, optional_questions, instructions } }]

  if (!sections || sections.length === 0) return res.status(400).json({ error: 'No sections provided' });

  db.query('DELETE FROM paper_sections WHERE paper_id = ?', [paperId], (err) => {
    if (err) return res.status(500).json({ error: 'Error clearing sections' });
    db.query('DELETE FROM paper_questions WHERE paper_id = ?', [paperId], (err) => {

      let newSectionIdMap = {};
      let sectionsCompleted = 0;
      let allGeneratedQuestions = [];
      let globalPool = [...availableQuestions];
      let errorOccurred = null;

      sections.forEach((sec, i) => {
        if (errorOccurred) return;

        db.query('INSERT INTO paper_sections (paper_id, name, description, total_marks, order_num, config) VALUES (?, ?, ?, ?, ?, ?)', 
        [paperId, sec.name, sec.config.instructions || '', sec.config.total_marks || 0, i+1, JSON.stringify(sec.config)], 
        (err, results) => {
          if (err) { errorOccurred = true; return res.status(500).json({ error: 'Error saving sections' }); }
          
          const dbSectionId = results.insertId;
          newSectionIdMap[sec.client_id] = dbSectionId;
          
          // Generate questions for this section
          const conf = sec.config;
          let pool = [...globalPool];
          
          // Filter out history if configured
          // Since the user wants "Generate Entire Question Paper", we will assume avoidDuplicates is highly desired, 
          // or we can just always avoid duplicates unless pool is empty. Let's do a strict approach.
          let qType = conf.question_type;
          if (qType && qType !== 'Mixed') {
            pool = pool.filter(q => q.question_type === qType);
          }
          if (conf.marks_per_question) {
            pool = pool.filter(q => q.marks == conf.marks_per_question);
          }
          
          // Handle Internal Choice logic
          let requiredQuestions = parseInt(conf.num_questions) || 0;
          let internalChoices = 0;
          if (conf.internal_choice === 'Yes') {
            internalChoices = parseInt(conf.optional_questions) || 0;
            requiredQuestions += internalChoices; // We need more questions to pair them up
          }
          
          let selectedForSection = [];
          
          if (pool.length < requiredQuestions) {
            errorOccurred = `Not enough valid questions in the bank for ${sec.name}. Need ${requiredQuestions}, found ${pool.length}.`;
          } else {
            // Greedy fill based on diffDist and bloomDist
            const calcTargets = (distObj, total) => {
              let targets = {}; let sum = 0;
              for (let k in distObj) {
                targets[k] = Math.round(total * (parseFloat(distObj[k]) / 100));
                sum += targets[k];
              }
              if (Object.keys(targets).length > 0) {
                const firstKey = Object.keys(targets)[0];
                targets[firstKey] += (total - sum);
              }
              return targets;
            };

            const tDiff = calcTargets(conf.diffDist || {}, requiredQuestions);
            const tBloom = calcTargets(conf.bloomDist || {}, requiredQuestions);
            
            let currentCounts = { diff: {}, bloom: {} };
            
            for (let j = 0; j < requiredQuestions; j++) {
              let bestScore = -1;
              let bestIndex = -1;
              for (let k = 0; k < pool.length; k++) {
                let q = pool[k];
                let score = 0;
                if (!q.history || q.history.length === 0) score += 5; // Prefer unused
                if (tDiff[q.difficulty_level] && (currentCounts.diff[q.difficulty_level] || 0) < tDiff[q.difficulty_level]) score += 10;
                if (tBloom[q.blooms_level] && (currentCounts.bloom[q.blooms_level] || 0) < tBloom[q.blooms_level]) score += 10;
                score += Math.random(); // tie-breaker
                
                if (score > bestScore) { bestScore = score; bestIndex = k; }
              }
              
              if (bestIndex !== -1) {
                const chosen = pool[bestIndex];
                selectedForSection.push(chosen);
                
                // Remove from global pool to avoid duplicates across sections!
                globalPool = globalPool.filter(g => g.id !== chosen.id);
                pool.splice(bestIndex, 1);
                
                currentCounts.diff[chosen.difficulty_level] = (currentCounts.diff[chosen.difficulty_level] || 0) + 1;
                currentCounts.bloom[chosen.blooms_level] = (currentCounts.bloom[chosen.blooms_level] || 0) + 1;
              }
            }
            
            // Map selected to paperQuestions format with optional groups
            let groupCounter = 1000 + i * 100; // unique group id bases per section
            let qIndex = 0;
            
            for (let j = 0; j < selectedForSection.length; j++) {
              let optGroupId = null;
              if (internalChoices > 0 && j >= selectedForSection.length - (internalChoices * 2)) {
                // Pair them up. E.g. if 2 optional choices, last 4 questions form 2 pairs
                let pairIndex = Math.floor((j - (selectedForSection.length - (internalChoices * 2))) / 2);
                optGroupId = groupCounter + pairIndex;
              }
              
              allGeneratedQuestions.push({
                paperId,
                sectionId: dbSectionId,
                questionId: selectedForSection[j].id,
                orderNum: ++qIndex,
                optGroup: optGroupId
              });
            }
          }
          
          sectionsCompleted++;
          if (sectionsCompleted === sections.length) {
            if (errorOccurred) {
              return res.status(400).json({ error: errorOccurred });
            }
            
            if (allGeneratedQuestions.length === 0) return res.json({ message: 'Saved successfully' });
            
            const values = allGeneratedQuestions.map(q => [q.paperId, q.sectionId, q.questionId, q.orderNum, q.optGroup]);
            db.query('INSERT INTO paper_questions (paper_id, section_id, question_id, order_num, optional_group_id) VALUES ?', [values], (err) => {
              if (err) return res.status(500).json({ error: 'Error saving generated questions' });
              res.json({ message: 'Paper generated successfully!' });
            });
          }
        });
      });
    });
  });
});

// Set the port the server will listen on
const PORT = 5000;

// --- ANSWER SHEETS API ROUTES ---

app.get('/api/answer-sheets', (req, res) => {
  const { paper_id } = req.query;
  let query = `
    SELECT 
      a.id, a.candidate_code, a.status, a.created_at as upload_date,
      s.roll_number, s.name as student_name,
      qp.exam_type, qp.academic_year, qp.id as paper_id,
      sub.subject_name as subject, sub.course, sub.program, sub.semester,
      af.original_filename, af.file_path,
      ea.status as evaluation_status, ea.assigned_date, ea.faculty_id as assigned_faculty_id,
      f.name as assigned_faculty_name
    FROM answer_sheets a
    LEFT JOIN students s ON a.student_id = s.id
    LEFT JOIN question_papers qp ON a.paper_id = qp.id
    LEFT JOIN subjects sub ON qp.subject_id = sub.id
    LEFT JOIN answer_sheet_files af ON a.id = af.answer_sheet_id AND af.file_type = 'Main'
    LEFT JOIN evaluation_assignments ea ON a.id = ea.answer_sheet_id
    LEFT JOIN faculty f ON ea.faculty_id = f.id
  `;
  let params = [];
  if (paper_id) {
    query += ' WHERE a.paper_id = ?';
    params.push(paper_id);
  }
  query += ' ORDER BY a.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching answer sheets:', err);
      return res.status(500).json({ error: 'Database error fetching answer sheets' });
    }
    res.json(results);
  });
});

app.post('/api/answer-sheets/upload', upload.array('pdfs'), async (req, res) => {
  const { paper_id } = req.body;
  if (!paper_id) {
    return res.status(400).json({ error: 'paper_id is required' });
  }

  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = [];

  try {
    for (const file of files) {
      const numbersInName = file.originalname.match(/\d+/g);
      let matchedStudentId = null;
      let status = 'Uploaded - Needs Linking';

      if (numbersInName) {
        const potentialRoll = numbersInName[0];
        const matchPromise = new Promise((resolve, reject) => {
          db.query('SELECT id FROM students WHERE roll_number = ?', [potentialRoll], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.length > 0 ? rows[0].id : null);
          });
        });
        
        matchedStudentId = await matchPromise;
        if (matchedStudentId) {
          status = 'Uploaded';
        }
      }

      const insertSheetPromise = new Promise((resolve, reject) => {
        const query = 'INSERT INTO answer_sheets (student_id, paper_id, status) VALUES (?, ?, ?)';
        db.query(query, [matchedStudentId, paper_id, status], (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        });
      });
      const answerSheetId = await insertSheetPromise;

      const filePath = `uploads/examination-answer-sheets/${file.filename}`;
      const insertFilePromise = new Promise((resolve, reject) => {
        const query = 'INSERT INTO answer_sheet_files (answer_sheet_id, file_path, original_filename, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [answerSheetId, filePath, file.originalname, 'Main', 'Admin'], (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        });
      });
      await insertFilePromise;

      results.push({
        original_filename: file.originalname,
        matched: !!matchedStudentId,
        answer_sheet_id: answerSheetId
      });
    }

    res.status(200).json({ message: 'Upload complete', results });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to process uploads' });
  }
});

app.post('/api/answer-sheets/:id/ocr', async (req, res) => {
  const answerSheetId = req.params.id;
  const { imageBase64 } = req.body; // the canvas extraction from the frontend

  if (!imageBase64) {
    return res.status(400).json({ error: 'Base64 image is required' });
  }

  try {
    // We can swap to 'mock' if tesseract fails or is too slow during dev
    const ocr = new OCRService('tesseract'); 
    const results = await ocr.processImage(imageBase64);
    res.json(results);
  } catch (err) {
    console.error('OCR Endpoint Error:', err);
    res.status(500).json({ error: 'OCR Processing failed' });
  }
});

app.get('/api/answer-sheets/check-duplicate', (req, res) => {
  const { student_id, paper_id } = req.query;
  if (!student_id || !paper_id) return res.status(400).json({ error: 'Missing parameters' });

  db.query('SELECT id FROM answer_sheets WHERE student_id = ? AND paper_id = ?', [student_id, paper_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ duplicateExists: results.length > 0 });
  });
});

app.post('/api/answer-sheets/:id/link', (req, res) => {
  const answerSheetId = req.params.id;
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: 'student_id is required' });

  db.query('UPDATE answer_sheets SET student_id = ?, status = ? WHERE id = ?', [student_id, 'Uploaded', answerSheetId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error linking student' });
    res.json({ message: 'Linked successfully' });
  });
});

app.delete('/api/answer-sheets/:id', (req, res) => {
  const answerSheetId = req.params.id;

  db.query(`
    SELECT ans.status, asf.file_path 
    FROM answer_sheets ans
    LEFT JOIN answer_sheet_files asf ON ans.id = asf.answer_sheet_id
    WHERE ans.id = ?
  `, [answerSheetId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching record' });
    if (results.length === 0) return res.status(404).json({ error: 'Answer sheet not found' });

    const record = results[0];
    
    // Protect evaluation workflow
    const protectedStatuses = ['Assigned', 'Under Evaluation', 'Moderation', 'Rechecking', 'Completed', 'Locked'];
    if (protectedStatuses.includes(record.status)) {
      return res.status(403).json({ error: 'Cannot delete: Answer sheet has already entered the evaluation workflow.' });
    }

    // Delete the file physically
    if (record.file_path) {
      // file_path is something like 'uploads/examination-answer-sheets/filename.pdf'
      // Need to resolve it relative to __dirname
      const fullPath = path.join(__dirname, record.file_path);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.error("Failed to delete physical file:", unlinkErr);
        }
      }
    }

    // Delete from DB (foreign keys will cascade to answer_sheet_files)
    db.query('DELETE FROM answer_sheets WHERE id = ?', [answerSheetId], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Database error during deletion' });
      res.json({ message: 'Examination Answer Sheet deleted successfully' });
    });
  });
});

// --- PHASE 5.4 FACULTY ASSIGNMENT ---

app.get('/api/faculty/workload', (req, res) => {
  const query = `
    SELECT 
      f.id, f.name, f.department,
      COUNT(ea.id) as current_workload
    FROM faculty f
    LEFT JOIN evaluation_assignments ea 
      ON f.id = ea.faculty_id 
      AND ea.status IN ('Assigned', 'Under Evaluation', 'Moderation', 'Rechecking')
    WHERE f.status = 'Active'
    GROUP BY f.id
    ORDER BY current_workload ASC, f.name ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching faculty workload' });
    res.json(results);
  });
});

app.post('/api/answer-sheets/assign', (req, res) => {
  const { sheetIds, facultyId, reason } = req.body;
  if (!sheetIds || !sheetIds.length || !facultyId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: 'Transaction start error' });

    const processSheet = (index) => {
      if (index >= sheetIds.length) {
        return db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => res.status(500).json({ error: 'Commit error' }));
          }
          res.json({ message: 'Assignment successful' });
        });
      }

      const sheetId = sheetIds[index];

      db.query('SELECT id FROM evaluation_assignments WHERE answer_sheet_id = ?', [sheetId], (err, eaRows) => {
        if (err) return db.rollback(() => res.status(500).json({ error: 'DB error' }));
        
        const proceedWithAnswerSheet = () => {
          db.query('UPDATE answer_sheets SET status = "Assigned" WHERE id = ? AND status = "Uploaded"', [sheetId], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: 'DB error' }));
            processSheet(index + 1);
          });
        };

        if (eaRows.length > 0) {
          db.query(
            'UPDATE evaluation_assignments SET faculty_id = ?, reason = ?, assigned_date = CURRENT_TIMESTAMP WHERE answer_sheet_id = ?', 
            [facultyId, reason || null, sheetId], 
            (err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: 'DB error' }));
              proceedWithAnswerSheet();
            }
          );
        } else {
          db.query(
            'INSERT INTO evaluation_assignments (answer_sheet_id, faculty_id, assignment_type, status, reason) VALUES (?, ?, ?, ?, ?)',
            [sheetId, facultyId, 'Primary', 'Assigned', reason || null],
            (err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: 'DB error' }));
              proceedWithAnswerSheet();
            }
          );
        }
      });
    };

    processSheet(0);
  });
});

// --- EVALUATION WORKSPACE APIs ---

// 1. Get Assigned Answer Sheets for a Faculty
app.get('/api/evaluations/assigned', (req, res) => {
  const facultyId = req.query.faculty_id || 1; // Default to mock faculty 1
  const query = `
    SELECT ea.id as assignment_id, ea.assignment_type, ea.status as assignment_status, ea.assigned_date,
           ans.id as answer_sheet_id, ans.candidate_code, ans.status as sheet_status,
           qp.paper_title, qp.course as course_name, qp.semester, sub.subject_name,
           es.id as session_id, es.status as session_status, es.total_marks_awarded, es.last_saved_at
    FROM evaluation_assignments ea
    JOIN answer_sheets ans ON ea.answer_sheet_id = ans.id
    JOIN question_papers qp ON ans.paper_id = qp.id
    JOIN subjects sub ON qp.subject_id = sub.id
    LEFT JOIN evaluation_sessions es ON ans.id = es.answer_sheet_id AND es.evaluator_id = ea.faculty_id
    WHERE ea.faculty_id = ?
    ORDER BY ea.assigned_date ASC
  `;
  db.query(query, [facultyId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// 2. Start/Initialize Evaluation Session
app.post('/api/evaluations/start/:answerSheetId', (req, res) => {
  const answerSheetId = req.params.answerSheetId;
  const facultyId = req.body.faculty_id || 1;

  db.query('SELECT id FROM evaluation_sessions WHERE answer_sheet_id = ? AND evaluator_id = ?', [answerSheetId, facultyId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (results.length > 0) {
      return res.json({ sessionId: results[0].id }); // Already exists
    }
    
    const insertQuery = 'INSERT INTO evaluation_sessions (answer_sheet_id, evaluator_id, status) VALUES (?, ?, ?)';
    db.query(insertQuery, [answerSheetId, facultyId, 'Draft'], (insertErr, result) => {
      if (insertErr) return res.status(500).json({ error: 'Failed to create session' });
      res.json({ sessionId: result.insertId });
    });
  });
});

// 3. Get Full Session Payload
app.get('/api/evaluations/session/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  // Get session details
  db.query('SELECT * FROM evaluation_sessions WHERE id = ?', [sessionId], (err, sessionRes) => {
    if (err || sessionRes.length === 0) return res.status(404).json({ error: 'Session not found' });
    const session = sessionRes[0];
    
    // Get answer sheet and paper info
    const q = `
      SELECT ans.candidate_code, ans.status as sheet_status,
             qp.id as paper_id, qp.paper_title, qp.total_marks
      FROM answer_sheets ans
      JOIN question_papers qp ON ans.paper_id = qp.id
      WHERE ans.id = ?
    `;
    db.query(q, [session.answer_sheet_id], (err2, paperRes) => {
      if (err2 || paperRes.length === 0) return res.status(500).json({ error: 'Failed to fetch paper info' });
      const paperInfo = paperRes[0];
      
      // Get exact generated paper structure
      db.query('SELECT id, name as section_name, description, total_marks, order_num FROM paper_sections WHERE paper_id = ? ORDER BY order_num ASC', [paperInfo.paper_id], (err3, sectionsRes) => {
        const sections = sectionsRes || [];
        
        db.query(`
          SELECT pq.id, pq.question_id, pq.order_num, pq.section_id, pq.optional_group_id, q.marks, q.question_text 
          FROM paper_questions pq 
          JOIN questions q ON pq.question_id = q.id 
          WHERE pq.paper_id = ? 
          ORDER BY pq.section_id ASC, pq.order_num ASC
        `, [paperInfo.paper_id], (err4, questionsRes) => {
          const paperQuestions = questionsRes || [];
          const builderData = { sections, paperQuestions };

          // Get PDF file path
          db.query('SELECT file_path FROM answer_sheet_files WHERE answer_sheet_id = ? LIMIT 1', [session.answer_sheet_id], (err5, fileRes) => {
            const pdfPath = (fileRes && fileRes.length > 0) ? fileRes[0].file_path : null;
            
            // Get existing marks
            db.query('SELECT * FROM evaluation_marks WHERE session_id = ?', [sessionId], (err6, marksRes) => {
              res.json({
                session: session,
                paper: paperInfo,
                builderData: builderData,
                student: { candidate_code: paperInfo.candidate_code },
                pdfUrl: pdfPath ? `http://localhost:5000/${pdfPath}` : null,
                existingMarks: marksRes || []
              });
            });
          });
        });
      });
    });
  });
});

// Save Evaluation Marks (Auto Save & Draft)
app.post('/api/evaluations/session/:sessionId/save', 
  (req, res, next) => {
    // If frontend sends text/plain due to missing fetch headers, force JSON
    if (!req.headers['content-type'] || req.headers['content-type'].includes('text/plain')) {
      req.headers['content-type'] = 'application/json';
    }
    next();
  },
  express.json(),
  (req, res) => {
  const sessionId = req.params.sessionId;
  const { marks, isComplete } = req.body; // Array of marks objects

  if (!Array.isArray(marks)) {
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  // Update session status
  const newStatus = isComplete ? 'Evaluation Submitted' : 'In Progress';
  db.query(`UPDATE evaluation_sessions SET status = ?, last_saved_at = CURRENT_TIMESTAMP WHERE id = ?`, [newStatus, sessionId], (err) => {
    if (err) {
      console.error('Failed to update session status:', err);
      return res.status(500).json({ error: 'Failed to update session' });
    }

    const processMarks = () => {
      if (marks.length === 0) {
        return res.json({ success: true, message: 'Session updated (no marks to save)' });
      }

      // Upsert marks
      const values = marks.map(m => [
        sessionId,
        m.question_id,
        m.section_name || '',
        m.question_number || '',
        m.marks_awarded === '' ? null : m.marks_awarded,
        m.max_marks,
        m.remarks || ''
      ]);

      const query = `
        INSERT INTO evaluation_marks (session_id, question_id, section_name, question_number, marks_awarded, max_marks, remarks)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          marks_awarded = VALUES(marks_awarded),
          remarks = VALUES(remarks),
          updated_at = CURRENT_TIMESTAMP
      `;

      db.query(query, [values], (err2) => {
        if (err2) {
          console.error('Failed to save evaluation marks:', err2);
          return res.status(500).json({ error: 'Failed to save marks' });
        }
        res.json({ success: true, message: 'Marks saved successfully' });
      });
    };

    if (isComplete) {
      // Also update the answer_sheets status
      db.query(`UPDATE answer_sheets SET status = 'Evaluation Submitted' WHERE id = (SELECT answer_sheet_id FROM evaluation_sessions WHERE id = ?)`, [sessionId], (err3) => {
        if (err3) console.error('Failed to update answer_sheets status:', err3);
        processMarks();
      });
    } else {
      processMarks();
    }
  });
});


// --- RESULTS MODULE APIs ---

// Dashboard Stats
app.get('/api/results/dashboard-stats', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = 'Generated' THEN 1 ELSE 0 END) AS pending_publications,
      SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) AS published_results,
      SUM(total_students) AS total_students_resulted
    FROM result_sets;
  `;
  db.query(query, (err, statsResult) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Also get total subjects evaluated from answer sheets
    const query2 = `
      SELECT COUNT(DISTINCT paper_id) AS total_subjects_evaluated
      FROM answer_sheets
      WHERE status = 'Evaluation Submitted'
    `;
    db.query(query2, (err, subjResult) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const stats = statsResult[0] || {};
      const subjs = subjResult[0] || {};
      
      res.json({
        pendingPublications: stats.pending_publications || 0,
        publishedResults: stats.published_results || 0,
        totalStudents: stats.total_students_resulted || 0,
        totalSubjectsEvaluated: subjs.total_subjects_evaluated || 0
      });
    });
  });
});

// List Result Sets
app.get('/api/results', (req, res) => {
  let { academic_year, exam_type, program, course, semester, section } = req.query;
  
  let query = `SELECT * FROM result_sets WHERE 1=1`;
  const params = [];
  
  if (academic_year) { query += ` AND academic_year = ?`; params.push(academic_year); }
  if (exam_type) { query += ` AND exam_type = ?`; params.push(exam_type); }
  if (program) { query += ` AND program = ?`; params.push(program); }
  if (course) { query += ` AND course = ?`; params.push(course); }
  if (semester) { query += ` AND semester = ?`; params.push(semester); }
  if (section) { query += ` AND section = ?`; params.push(section); }
  
  query += ` ORDER BY generated_at DESC`;
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Generate Preview
app.post('/api/results/generate-preview', (req, res) => {
  const { academic_year, exam_type, program, course, semester, section } = req.body;
  if (!academic_year || !exam_type || !program || !course || !semester) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // 1. Find matching question papers
  const qpQuery = `SELECT id, paper_title, total_marks FROM question_papers WHERE academic_year = ? AND exam_type = ? AND program = ? AND course = ? AND semester = ?`;
  db.query(qpQuery, [academic_year, exam_type, program, course, semester], (err, papers) => {
    if (err) return res.status(500).json({ error: err.message });
    if (papers.length === 0) return res.status(404).json({ error: 'No question papers found for the selected criteria' });
    
    const paperIds = papers.map(p => p.id);
    
    // 2. Find matching students
    let stQuery = `SELECT id, roll_number, name FROM students WHERE program = ? AND course = ? AND semester = ?`;
    let stParams = [program, course, semester];
    if (section) {
      stQuery += ` AND section = ?`;
      stParams.push(section);
    }
    
    db.query(stQuery, stParams, (err, students) => {
      if (err) return res.status(500).json({ error: err.message });
      if (students.length === 0) return res.status(404).json({ error: 'No students found for the selected criteria' });
      
      const studentIds = students.map(s => s.id);
      
      // 3. Find answer sheets & evaluations for these students and papers
      const ansQuery = `
        SELECT a.student_id, a.candidate_code, a.paper_id, e.total_marks_awarded
        FROM answer_sheets a
        JOIN evaluation_sessions e ON a.id = e.answer_sheet_id
        WHERE a.student_id IN (?) AND a.paper_id IN (?) AND a.status = 'Evaluation Submitted'
      `;
      
      db.query(ansQuery, [studentIds, paperIds], (err, sheets) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 4. Calculate totals per student
        const results = students.map(student => {
          const studentSheets = sheets.filter(s => s.student_id === student.id);
          const subjects_evaluated = studentSheets.length;
          
          let total_marks = 0;
          let max_marks_possible = 0;
          
          studentSheets.forEach(sheet => {
            total_marks += parseFloat(sheet.total_marks_awarded || 0);
            const paper = papers.find(p => p.id === sheet.paper_id);
            if (paper) max_marks_possible += (paper.total_marks || 100);
          });
          
          const candidate_code = studentSheets.length > 0 ? studentSheets[0].candidate_code : null;
          
          let percentage = 0;
          if (max_marks_possible > 0) {
            percentage = (total_marks / max_marks_possible) * 100;
          }
          
          const status = percentage >= 40 ? 'Pass' : 'Fail';
          
          return {
            student_id: student.id,
            roll_number: student.roll_number,
            candidate_code: candidate_code || '-',
            student_name: student.name,
            subjects_evaluated: subjects_evaluated,
            total_marks: total_marks.toFixed(2),
            percentage: percentage.toFixed(2),
            status: subjects_evaluated > 0 ? status : 'Pending'
          };
        });
        
        res.json({ students: results, total_papers: papers.length });
      });
    });
  });
});

// Generate (Save) Results
app.post('/api/results/generate', (req, res) => {
  const { academic_year, exam_type, program, course, semester, section, students } = req.body;
  
  if (!students || students.length === 0) {
    return res.status(400).json({ error: 'No students provided' });
  }
  
  // 1. Create result_set
  const setQuery = `
    INSERT INTO result_sets (academic_year, exam_type, program, course, semester, section, total_students, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Generated')
  `;
  const setParams = [academic_year, exam_type, program, course, semester, section || null, students.length];
  
  db.query(setQuery, setParams, (err, setResult) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const resultSetId = setResult.insertId;
    
    // 2. Insert student_results
    const values = students.map(s => [
      resultSetId, s.student_id, s.roll_number, s.candidate_code, s.student_name,
      s.subjects_evaluated, s.total_marks, s.percentage, s.status
    ]);
    
    const stQuery = `
      INSERT INTO student_results 
      (result_set_id, student_id, roll_number, candidate_code, student_name, subjects_evaluated, total_marks, percentage, status)
      VALUES ?
    `;
    
    db.query(stQuery, [values], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Result set generated successfully', result_set_id: resultSetId });
    });
  });
});

// View student results in a result set
app.get('/api/results/:id/students', (req, res) => {
  const setId = req.params.id;
  db.query(`SELECT * FROM student_results WHERE result_set_id = ?`, [setId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Publish Results
app.put('/api/results/:id/publish', (req, res) => {
  const setId = req.params.id;
  db.query(`UPDATE result_sets SET status = 'Published', published_at = CURRENT_TIMESTAMP WHERE id = ?`, [setId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Results published successfully' });
  });
});


// ==========================================
// PHASE 7: RECHECKING REQUESTS
// ==========================================

// Get Dashboard Stats
app.get('/api/rechecking/dashboard-stats', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
      SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assignedRequests,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedRequests,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedRequests
    FROM rechecking_requests
  `;
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
  
  let query = `
    SELECT r.*, s.name as student_name, s.roll_number, s.candidate_code,
           qp.paper_title, qp.academic_year, qp.exam_type, qp.program, qp.course, qp.semester,
           f.name as evaluator_name
    FROM rechecking_requests r
    JOIN students s ON r.student_id = s.id
    JOIN question_papers qp ON r.paper_id = qp.id
    LEFT JOIN faculty f ON r.evaluator_id = f.id
    WHERE 1=1
  `;
  const params = [];
  
  if (academic_year) { query += ` AND qp.academic_year = ?`; params.push(academic_year); }
  if (exam_type) { query += ` AND qp.exam_type = ?`; params.push(exam_type); }
  if (program) { query += ` AND qp.program = ?`; params.push(program); }
  if (course) { query += ` AND qp.course = ?`; params.push(course); }
  if (semester) { query += ` AND qp.semester = ?`; params.push(semester); }
  if (subject) { query += ` AND qp.paper_title LIKE ?`; params.push(`%${subject}%`); }
  if (status) { query += ` AND r.status = ?`; params.push(status); }
  
  query += ` ORDER BY r.requested_on DESC`;
  
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

  db.query(`SELECT id FROM answer_sheets WHERE student_id = ? AND paper_id = ? AND status = 'Evaluation Submitted'`, [student_id, paper_id], (err, sheets) => {
    if (err) return res.status(500).json({ error: err.message });
    if (sheets.length === 0) return res.status(404).json({ error: 'No evaluated answer sheet found for this student and subject' });
    
    const answer_sheet_id = sheets[0].id;

    db.query(`SELECT total_marks_awarded FROM evaluation_sessions WHERE answer_sheet_id = ?`, [answer_sheet_id], (err, sessions) => {
      if (err) return res.status(500).json({ error: err.message });
      let original_marks = 0;
      if (sessions.length > 0 && sessions[0].total_marks_awarded != null) {
        original_marks = sessions[0].total_marks_awarded;
      }

      db.query(
        `INSERT INTO rechecking_requests (student_id, paper_id, answer_sheet_id, reason, priority, remarks, original_marks) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    `UPDATE rechecking_requests SET evaluator_id = ?, status = 'Assigned', assigned_on = CURRENT_TIMESTAMP WHERE id = ?`,
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
  
  db.query(`
    SELECT r.*, s.name as student_name, s.roll_number, s.candidate_code,
           qp.paper_title, qp.total_marks as max_marks,
           a.file_url, a.file_path, a.status as answer_sheet_status
    FROM rechecking_requests r
    JOIN students s ON r.student_id = s.id
    JOIN question_papers qp ON r.paper_id = qp.id
    JOIN answer_sheets a ON r.answer_sheet_id = a.id
    WHERE r.id = ?
  `, [reqId], (err, requests) => {
    if (err) return res.status(500).json({ error: err.message });
    if (requests.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const requestData = requests[0];
    
    db.query('SELECT * FROM paper_questions WHERE paper_id = ? ORDER BY question_number', [requestData.paper_id], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.query(`
        SELECT question_id, marks_awarded 
        FROM evaluation_marks em
        JOIN evaluation_sessions es ON em.session_id = es.id
        WHERE es.answer_sheet_id = ?
      `, [requestData.answer_sheet_id], (err, marks) => {
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
  db.query(`UPDATE rechecking_requests SET status = ? WHERE id = ?`, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: `Request status updated to ${status}` });
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
        `UPDATE rechecking_requests SET status = 'Completed', completed_on = CURRENT_TIMESTAMP, revised_marks = ? WHERE id = ?`,
        [total_marks, reqId],
        (err) => {
          if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
          
          db.query(`SELECT answer_sheet_id, original_marks FROM rechecking_requests WHERE id = ?`, [reqId], (err, reqs) => {
            if (err || reqs.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Not found' }));
            
            const ansId = reqs[0].answer_sheet_id;
            
            db.query(`UPDATE evaluation_sessions SET total_marks_awarded = ? WHERE answer_sheet_id = ?`, [total_marks, ansId], (err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
              
              db.query(`SELECT id FROM evaluation_sessions WHERE answer_sheet_id = ?`, [ansId], (err, sessions) => {
                if (err || sessions.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Session not found' }));
                const sessionId = sessions[0].id;
                
                let completedUpdates = 0;
                if (marks.length === 0) return commitTransaction();
                
                marks.forEach(m => {
                  db.query(
                    `UPDATE evaluation_marks SET marks_awarded = ? WHERE session_id = ? AND question_id = ?`,
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
                  db.query(`SELECT student_id, paper_id FROM answer_sheets WHERE id = ?`, [ansId], (err, sheets) => {
                     if (err || sheets.length === 0) return commitTransaction();
                     
                     db.query(`
                        UPDATE student_results sr
                        JOIN result_sets rs ON sr.result_set_id = rs.id
                        JOIN question_papers qp ON qp.academic_year = rs.academic_year AND qp.exam_type = rs.exam_type
                        SET sr.marks_obtained = ?, sr.percentage = ( ? / qp.total_marks ) * 100
                        WHERE sr.student_id = ? AND qp.id = ?
                     `, [total_marks, total_marks, sheets[0].student_id, sheets[0].paper_id], (err) => {
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


// ==========================================
// PHASE 7: RECHECKING REQUESTS
// ==========================================

// Get Dashboard Stats
app.get('/api/rechecking/dashboard-stats', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingRequests,
      SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assignedRequests,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedRequests,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedRequests
    FROM rechecking_requests
  `;
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
  
  let query = `
    SELECT r.*, s.name as student_name, s.roll_number, s.candidate_code,
           qp.paper_title, qp.academic_year, qp.exam_type, qp.program, qp.course, qp.semester,
           f.name as evaluator_name
    FROM rechecking_requests r
    JOIN students s ON r.student_id = s.id
    JOIN question_papers qp ON r.paper_id = qp.id
    LEFT JOIN faculty f ON r.evaluator_id = f.id
    WHERE 1=1
  `;
  const params = [];
  
  if (academic_year) { query += ` AND qp.academic_year = ?`; params.push(academic_year); }
  if (exam_type) { query += ` AND qp.exam_type = ?`; params.push(exam_type); }
  if (program) { query += ` AND qp.program = ?`; params.push(program); }
  if (course) { query += ` AND qp.course = ?`; params.push(course); }
  if (semester) { query += ` AND qp.semester = ?`; params.push(semester); }
  if (subject) { query += ` AND qp.paper_title LIKE ?`; params.push(`%${subject}%`); }
  if (status) { query += ` AND r.status = ?`; params.push(status); }
  
  query += ` ORDER BY r.requested_on DESC`;
  
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

  db.query(`SELECT id FROM answer_sheets WHERE student_id = ? AND paper_id = ? AND status = 'Evaluation Submitted'`, [student_id, paper_id], (err, sheets) => {
    if (err) return res.status(500).json({ error: err.message });
    if (sheets.length === 0) return res.status(404).json({ error: 'No evaluated answer sheet found for this student and subject' });
    
    const answer_sheet_id = sheets[0].id;

    db.query(`SELECT total_marks_awarded FROM evaluation_sessions WHERE answer_sheet_id = ?`, [answer_sheet_id], (err, sessions) => {
      if (err) return res.status(500).json({ error: err.message });
      let original_marks = 0;
      if (sessions.length > 0 && sessions[0].total_marks_awarded != null) {
        original_marks = sessions[0].total_marks_awarded;
      }

      db.query(
        `INSERT INTO rechecking_requests (student_id, paper_id, answer_sheet_id, reason, priority, remarks, original_marks) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    `UPDATE rechecking_requests SET evaluator_id = ?, status = 'Assigned', assigned_on = CURRENT_TIMESTAMP WHERE id = ?`,
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
  
  db.query(`
    SELECT r.*, s.name as student_name, s.roll_number, s.candidate_code,
           qp.paper_title, qp.total_marks as max_marks,
           a.file_url, a.file_path, a.status as answer_sheet_status
    FROM rechecking_requests r
    JOIN students s ON r.student_id = s.id
    JOIN question_papers qp ON r.paper_id = qp.id
    JOIN answer_sheets a ON r.answer_sheet_id = a.id
    WHERE r.id = ?
  `, [reqId], (err, requests) => {
    if (err) return res.status(500).json({ error: err.message });
    if (requests.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const requestData = requests[0];
    
    db.query('SELECT * FROM paper_questions WHERE paper_id = ? ORDER BY question_number', [requestData.paper_id], (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.query(`
        SELECT question_id, marks_awarded 
        FROM evaluation_marks em
        JOIN evaluation_sessions es ON em.session_id = es.id
        WHERE es.answer_sheet_id = ?
      `, [requestData.answer_sheet_id], (err, marks) => {
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
  db.query(`UPDATE rechecking_requests SET status = ? WHERE id = ?`, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: `Request status updated to ${status}` });
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
        `UPDATE rechecking_requests SET status = 'Completed', completed_on = CURRENT_TIMESTAMP, revised_marks = ? WHERE id = ?`,
        [total_marks, reqId],
        (err) => {
          if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
          
          db.query(`SELECT answer_sheet_id, original_marks FROM rechecking_requests WHERE id = ?`, [reqId], (err, reqs) => {
            if (err || reqs.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Not found' }));
            
            const ansId = reqs[0].answer_sheet_id;
            
            db.query(`UPDATE evaluation_sessions SET total_marks_awarded = ? WHERE answer_sheet_id = ?`, [total_marks, ansId], (err) => {
              if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
              
              db.query(`SELECT id FROM evaluation_sessions WHERE answer_sheet_id = ?`, [ansId], (err, sessions) => {
                if (err || sessions.length === 0) return db.rollback(() => res.status(500).json({ error: err ? err.message : 'Session not found' }));
                const sessionId = sessions[0].id;
                
                let completedUpdates = 0;
                if (marks.length === 0) return commitTransaction();
                
                marks.forEach(m => {
                  db.query(
                    `UPDATE evaluation_marks SET marks_awarded = ? WHERE session_id = ? AND question_id = ?`,
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
                  db.query(`SELECT student_id, paper_id FROM answer_sheets WHERE id = ?`, [ansId], (err, sheets) => {
                     if (err || sheets.length === 0) return commitTransaction();
                     
                     db.query(`
                        UPDATE student_results sr
                        JOIN result_sets rs ON sr.result_set_id = rs.id
                        JOIN question_papers qp ON qp.academic_year = rs.academic_year AND qp.exam_type = rs.exam_type
                        SET sr.marks_obtained = ?, sr.percentage = ( ? / qp.total_marks ) * 100
                        WHERE sr.student_id = ? AND qp.id = ?
                     `, [total_marks, total_marks, sheets[0].student_id, sheets[0].paper_id], (err) => {
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
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

