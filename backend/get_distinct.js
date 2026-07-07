const mysql = require('mysql2/promise');

async function getDistinctValues() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  const [academicYears] = await connection.execute('SELECT DISTINCT academic_year FROM question_papers');
  const [examTypes] = await connection.execute('SELECT DISTINCT exam_type FROM question_papers');
  const [programs] = await connection.execute('SELECT DISTINCT program FROM question_papers');
  const [courses] = await connection.execute('SELECT DISTINCT course FROM question_papers');
  const [semesters] = await connection.execute('SELECT DISTINCT semester FROM question_papers');

  console.log('Academic Years:', academicYears.map(r => r.academic_year));
  console.log('Exam Types:', examTypes.map(r => r.exam_type));
  console.log('Programs:', programs.map(r => r.program));
  console.log('Courses:', courses.map(r => r.course));
  console.log('Semesters:', semesters.map(r => r.semester));

  await connection.end();
}

getDistinctValues().catch(console.error);
