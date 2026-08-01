const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

// 1. Add Middleware for context
const middlewareCode = `
// --- MULTI-TENANT MIDDLEWARE ---
app.use((req, res, next) => {
  const uniId = req.headers['x-university-id'];
  const role = req.headers['x-user-role'];
  if (uniId && uniId !== 'null' && uniId !== 'undefined') {
    req.universityId = parseInt(uniId, 10);
  }
  if (role) {
    req.userRole = role;
  }
  next();
});
`;
if (!content.includes('MULTI-TENANT MIDDLEWARE')) {
  content = content.replace('app.use(express.json({ limit: \'50mb\' }));', `app.use(express.json({ limit: '50mb' }));\n${middlewareCode}`);
}

// 2. Patch POST /api/students
if (!content.includes('university_id) VALUES (?, ?, ?, ?, ?, ?, ?)')) {
  content = content.replace(
    'INSERT INTO students (name, email, roll_number, roll_no, program, course, semester) VALUES (?, ?, ?, ?, ?, ?, ?)',
    'INSERT INTO students (name, email, roll_number, roll_no, program, course, semester, university_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  content = content.replace(
    'const values = [name, email, roll_number, roll_no, program, course, semester];',
    'const values = [name, email, roll_number, roll_no, program, course, semester, req.universityId || null];'
  );
}

// 3. Patch GET /api/students
const getStudentsSearchOld = `SELECT id, name, roll_number, roll_no, program, course, semester 
      FROM students 
      \${whereClause}
      LIMIT 100`;
const getStudentsSearchNew = `SELECT id, name, roll_number, roll_no, program, course, semester 
      FROM students 
      \${whereClause} \${whereClause ? 'AND' : 'WHERE'} (university_id = ? OR ? IS NULL)
      LIMIT 100`;
if (content.includes(getStudentsSearchOld)) {
  content = content.replace(getStudentsSearchOld, getStudentsSearchNew);
  content = content.replace(
    'db.query(query, params, (err, results) => {',
    'params.push(req.universityId || null, req.universityId || null);\n    db.query(query, params, (err, results) => {'
  );
}

// Another GET /api/students
if (content.includes("db.query('SELECT * FROM students', (err, results) => {")) {
  content = content.replace(
    "db.query('SELECT * FROM students', (err, results) => {",
    "const query = req.universityId ? 'SELECT * FROM students WHERE university_id = ?' : 'SELECT * FROM students';\n  const params = req.universityId ? [req.universityId] : [];\n  db.query(query, params, (err, results) => {"
  );
}

// 4. Patch POST /api/faculty
if (!content.includes('university_id) VALUES (?, ?, ?, ?)')) {
  content = content.replace(
    'INSERT INTO faculty (name, email, department, status) VALUES (?, ?, ?, ?)',
    'INSERT INTO faculty (name, email, department, status, university_id) VALUES (?, ?, ?, ?, ?)'
  );
  content = content.replace(
    'const values = [name, email, department, status || \'active\'];',
    'const values = [name, email, department, status || \'active\', req.universityId || null];'
  );
}

// 5. Patch GET /api/faculty
if (content.includes("db.query('SELECT * FROM faculty', (err, results) => {")) {
  content = content.replace(
    "db.query('SELECT * FROM faculty', (err, results) => {",
    "const query = req.universityId ? 'SELECT * FROM faculty WHERE university_id = ?' : 'SELECT * FROM faculty';\n  const params = req.universityId ? [req.universityId] : [];\n  db.query(query, params, (err, results) => {"
  );
}

// 6. Patch POST /api/subjects
if (!content.includes('university_id) VALUES (?, ?, ?, ?, ?)')) {
  content = content.replace(
    'INSERT INTO subjects (code, name, program, semester, credits) VALUES (?, ?, ?, ?, ?)',
    'INSERT INTO subjects (code, name, program, semester, credits, university_id) VALUES (?, ?, ?, ?, ?, ?)'
  );
  content = content.replace(
    'const values = [code, name, program, semester, credits];',
    'const values = [code, name, program, semester, credits, req.universityId || null];'
  );
}

// 7. Patch GET /api/subjects
if (content.includes("db.query('SELECT * FROM subjects', (err, results) => {")) {
  content = content.replace(
    "db.query('SELECT * FROM subjects', (err, results) => {",
    "const query = req.universityId ? 'SELECT * FROM subjects WHERE university_id = ?' : 'SELECT * FROM subjects';\n  const params = req.universityId ? [req.universityId] : [];\n  db.query(query, params, (err, results) => {"
  );
}

fs.writeFileSync('server.js', content);
console.log('Successfully patched server.js for multi-tenancy on primary tables.');
