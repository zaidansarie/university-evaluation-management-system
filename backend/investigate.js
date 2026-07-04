const db = require('./db');
const http = require('http');

async function investigate() {
  console.log("1. Database Connection Info:");
  console.log(`Database Name: ${db.config.database}`);
  console.log(`Host: ${db.config.host}`);
  console.log(`User: ${db.config.user}`);

  console.log("\n2. Checking Table Counts:");
  const tables = ['courses', 'question_papers', 'subjects', 'schools', 'semesters'];
  for (const table of tables) {
    try {
      const [rows] = await db.promise().query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`- ${table}: ${rows[0].count} rows`);
    } catch (err) {
      console.log(`- ${table}: ERROR (${err.message})`);
    }
  }

  console.log("\n3. Testing Endpoints:");
  const testEndpoint = (path) => {
    return new Promise((resolve) => {
      http.get(`http://localhost:5000${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`GET ${path} - Status: ${res.statusCode}, Data length: ${data.length}`);
          resolve();
        });
      }).on('error', (err) => {
        console.log(`GET ${path} - ERROR: ${err.message}`);
        resolve();
      });
    });
  };

  await testEndpoint('/api/courses');
  await testEndpoint('/api/question-papers');

  console.log("\nFinished investigation.");
  db.end();
}

investigate();
