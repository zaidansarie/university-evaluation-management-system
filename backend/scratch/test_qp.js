const http = require('http');

const data = JSON.stringify({
  academic_year: '2026-27',
  exam_type: 'Mid Semester',
  course: 'B.Tech',
  program: 'Computer Science Engineering',
  school: 'School of Computer Science',
  subject_id: 1, // Just using some dummy subject id
  semester: 1,
  paper_title: 'Test Paper Structure',
  total_marks: 50,
  sections: [
    { name: 'Section A', total_marks: 20, config: { num_questions: 10, question_type: 'MCQ' } },
    { name: 'Section B', total_marks: 30, config: { num_questions: 5, question_type: 'Long Answer' } }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/question-papers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
