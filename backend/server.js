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
  const { q } = req.query;
  
  if (!q) {
    const query = `
      SELECT id, name, roll_number, candidate_code, program, course, semester 
      FROM students 
      LIMIT 100
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    });
    return;
  }
  
  const query = `
    SELECT id, name, roll_number, candidate_code, program, course, semester 
    FROM students 
    WHERE name LIKE ? OR roll_number LIKE ? OR candidate_code LIKE ?
    LIMIT 20
  `;
  const likeQ = `%${q}%`;
  
  db.query(query, [likeQ, likeQ, likeQ], (err, results) => {
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
    SELECT question_papers.*, subjects.subject_name, subjects.subject_code, faculty.name AS creator_name
    FROM question_papers
    LEFT JOIN subjects ON question_papers.subject_id = subjects.id
    LEFT JOIN faculty ON question_papers.created_by = faculty.id
    ORDER BY question_papers.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching question papers:', err);
      return res.status(500).json({ error: 'Database error fetching question papers' });
    }
    res.json(results);
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
  const query = `
    SELECT 
      ans.id,
      ans.candidate_code,
      ans.status,
      ans.created_at as upload_date,
      s.roll_number,
      s.name as student_name,
      p.paper_title as subject,
      p.course,
      p.program,
      p.semester,
      p.exam_type,
      p.academic_year,
      f.file_path,
      f.original_filename,
      f.uploaded_by,
      fac.name as assigned_faculty_name
    FROM answer_sheets ans
    LEFT JOIN students s ON ans.student_id = s.id
    LEFT JOIN question_papers p ON ans.paper_id = p.id
    LEFT JOIN answer_sheet_files f ON ans.id = f.answer_sheet_id AND f.file_type = 'Main'
    LEFT JOIN evaluation_assignments ea ON ans.id = ea.answer_sheet_id AND ea.assignment_type = 'Primary'
    LEFT JOIN faculty fac ON ea.faculty_id = fac.id
    ORDER BY ans.created_at DESC
  `;
  
  db.query(query, (err, results) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
