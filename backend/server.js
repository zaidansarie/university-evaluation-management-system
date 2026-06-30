const express = require('express');
const cors = require('cors');

// Import the database connection (this will also test the connection when server starts)
const db = require('./db');

// Initialize the Express application
const app = express();

// Middleware setup
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Allow parsing of JSON data in requests

// A simple test route to verify the server is working
app.get('/', (req, res) => {
  res.send('Backend is running');
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

// Set the port the server will listen on
const PORT = 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
