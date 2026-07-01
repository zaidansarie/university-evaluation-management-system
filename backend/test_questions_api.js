const http = require('http');

const optionsPost = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/questions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  question_code: 'CS101-Q1',
  subject_id: null,
  unit: 'Unit 1',
  question_text: 'What is a variable?',
  question_type: 'Short Answer',
  blooms_level: 'Remember',
  difficulty_level: 'Easy',
  marks: 2,
  status: 'Active',
  created_by: null
});

const reqPost = http.request(optionsPost, (res) => {
  console.log(\`POST STATUS: \${res.statusCode}\`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
  res.on('end', () => {
    console.log('\\n');
    
    // Now GET all questions
    http.get('http://localhost:5000/api/questions', (res) => {
      console.log(\`GET STATUS: \${res.statusCode}\`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(JSON.parse(data));
      });
    }).on('error', (e) => {
      console.error(e);
    });
  });
});

reqPost.on('error', (e) => {
  console.error(e);
});

reqPost.write(data);
reqPost.end();
