const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/question-papers/2/builder-data',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', d => {
    data += d;
  });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
