const db = require('./db');

const firstNames = [
  'Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Kabir', 'Dhruv', 'Aryan', 'Vivaan',
  'Ananya', 'Diya', 'Suhana', 'Priya', 'Kavya', 'Neha', 'Pooja', 'Riya', 'Aisha', 'Tanvi'
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Reddy', 'Gupta', 'Joshi', 'Chopra', 'Yadav',
  'Desai', 'Iyer', 'Nair', 'Bose', 'Mukherjee', 'Rao', 'Bhat', 'Verma', 'Kaur', 'Srinivas'
];

function generateStudents() {
  const students = [];
  let rollStart = 590017500;
  let ccStart = 220100;
  
  for (let i = 0; i < 100; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    students.push([
      `${rollStart + i}`,
      `${ccStart + i}`,
      `${fn} ${ln}`,
      `student${i}@university.edu`,
      'B.Tech',
      'Computer Science Engineering (CSE)',
      3,
      'A',
      `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      'Active'
    ]);
  }
  return students;
}

const facultyNames = [
  'Dr. Ramesh Kumar', 'Dr. Sunita Sharma', 'Prof. Arvind Patel', 'Dr. Meena Iyer',
  'Dr. Suresh Reddy', 'Prof. Kavita Rao', 'Dr. Vikram Singh', 'Dr. Priya Desai',
  'Prof. Anil Gupta', 'Dr. Neha Joshi'
];

const designations = ['Professor', 'Associate Professor', 'Assistant Professor'];

function generateFaculty() {
  const faculty = [];
  let empStart = 10001;
  
  for (let i = 0; i < 10; i++) {
    const desig = designations[Math.floor(Math.random() * designations.length)];
    faculty.push([
      facultyNames[i],
      `EMP${empStart + i}`,
      `faculty${i}@university.edu`,
      'Computer Science Engineering',
      desig,
      `+91 99${Math.floor(10000000 + Math.random() * 90000000)}`,
      'Active'
    ]);
  }
  return faculty;
}

async function runSeeder() {
  console.log('Running seeder...');

  try {
    // 1. Alter Students Table
    try {
      await new Promise((resolve, reject) => {
        db.query('ALTER TABLE students ADD COLUMN candidate_code VARCHAR(100) UNIQUE AFTER roll_number', (err) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          resolve();
        });
      });
      console.log('✅ Added candidate_code to students (if not exists)');
    } catch(err) { console.error(err); }

    // 2. Alter Faculty Table
    try {
      await new Promise((resolve, reject) => {
        db.query('ALTER TABLE faculty ADD COLUMN employee_id VARCHAR(50) UNIQUE AFTER name', (err) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          resolve();
        });
      });
      console.log('✅ Added employee_id to faculty');
    } catch(err) { console.error(err); }

    try {
      await new Promise((resolve, reject) => {
        db.query('ALTER TABLE faculty ADD COLUMN designation VARCHAR(100) AFTER department', (err) => {
          if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
          resolve();
        });
      });
      console.log('✅ Added designation to faculty');
    } catch(err) { console.error(err); }

    // 3. Clear existing dummy data if necessary (optional, but requested 100 students)
    // We'll just insert ignoring duplicates if they exist, or truncate and reset if we want a clean state.
    // Let's clear students and faculty for a clean demo state.
    // Need to disable foreign key checks temporarily.
    await new Promise((resolve) => db.query('SET FOREIGN_KEY_CHECKS = 0', resolve));
    await new Promise((resolve) => db.query('TRUNCATE TABLE students', resolve));
    await new Promise((resolve) => db.query('TRUNCATE TABLE faculty', resolve));
    await new Promise((resolve) => db.query('SET FOREIGN_KEY_CHECKS = 1', resolve));
    console.log('✅ Cleared existing students and faculty for clean seed');

    // 4. Insert Students
    const studentsData = generateStudents();
    await new Promise((resolve, reject) => {
      const q = 'INSERT INTO students (roll_number, candidate_code, name, email, course, program, semester, section, phone_number, status) VALUES ?';
      db.query(q, [studentsData], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`✅ Inserted ${studentsData.length} students.`);

    // 5. Insert Faculty
    const facultyData = generateFaculty();
    await new Promise((resolve, reject) => {
      const q = 'INSERT INTO faculty (name, employee_id, email, department, designation, phone_number, status) VALUES ?';
      db.query(q, [facultyData], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`✅ Inserted ${facultyData.length} faculty members.`);

    console.log('🎉 Seeding complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

// Allow time for DB connection to establish if necessary
setTimeout(runSeeder, 1000);
