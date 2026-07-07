// using native fetch

async function run() {
  console.log('--- GENERATING PREVIEW ---');
  const previewPayload = {
    academic_year: '2023-24',
    exam_type: 'Mid Semester',
    program: 'Computer Science Engineering (CSE)',
    course: 'B.Tech',
    semester: '3',
    section: ''
  };

  let res = await fetch('http://localhost:5000/api/results/generate-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(previewPayload)
  });
  
  let data = await res.json();
  console.log('PREVIEW RESULT:', data);

  if (data.students && data.students.length > 0) {
    console.log('--- GENERATING RESULTS ---');
    const generatePayload = {
      ...previewPayload,
      students: data.students
    };
    
    let genRes = await fetch('http://localhost:5000/api/results/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generatePayload)
    });
    
    let genData = await genRes.json();
    console.log('GENERATE RESULT:', genData);
    
    console.log('--- FETCHING RESULTS DASHBOARD ---');
    let dashRes = await fetch('http://localhost:5000/api/results');
    let dashData = await dashRes.json();
    console.log('DASHBOARD DATA:', dashData);
  } else {
    console.log('No students found to generate results for.');
  }
}

run();
