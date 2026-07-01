const API_BASE = 'http://localhost:5000/api';

const subjectData = {
  course: 'B.Tech',
  program: 'Computer Science Engineering (CSE)',
  school: 'School of Computer Science (SOCS)',
  semester: 3,
  subject_code: 'CS301',
  subject_name: 'Database Management System',
  credits: 4,
  status: 'Active'
};

const unitsData = [
  'Introduction to DBMS',
  'Relational Data Model',
  'SQL',
  'Transaction Management & Concurrency Control',
  'Normalization and NoSQL'
];

async function seed() {
  try {
    console.log('🚀 Starting Data Seed...');
    
    // 1. Check if CS301 exists
    const subRes = await fetch(`${API_BASE}/subjects`);
    let subjects = await subRes.json();
    let subject = subjects.find(s => s.subject_code === 'CS301');

    if (!subject) {
      console.log('Creating Subject: CS301...');
      const createSubRes = await fetch(`${API_BASE}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subjectData, units: unitsData.map(u => ({ unit_name: u })) })
      });
      const createSubData = await createSubRes.json();
      subject = { id: createSubData.id };
    } else {
      console.log('Subject CS301 already exists. Updating units just in case...');
      await fetch(`${API_BASE}/subjects/${subject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subjectData, units: unitsData.map(u => ({ unit_name: u })) })
      });
    }

    console.log('📝 Generating 100 DBMS questions (20 per unit)...');
    
    // Realistic DBMS Topics per Unit
    const unitTopics = [
      ["DBMS architecture", "Data Independence", "File systems vs DBMS", "Three-schema architecture", "DBA roles"], // Unit 1
      ["Relational Algebra", "Keys (Primary, Foreign, Candidate)", "Entity-Relationship Model", "Mapping ER to Relational", "Domain constraints"], // Unit 2
      ["DML/DDL commands", "Joins", "Subqueries", "Triggers", "Views", "Aggregate Functions"], // Unit 3
      ["ACID Properties", "Two-Phase Locking", "Deadlocks", "Serializability", "Write-ahead logging"], // Unit 4
      ["1NF, 2NF, 3NF, BCNF", "Functional Dependencies", "CAP Theorem", "Document Databases", "MongoDB vs SQL"] // Unit 5
    ];

    const types = ['MCQ', 'Short Answer', 'Long Answer', 'Numerical'];
    const diffs = ['Easy', 'Medium', 'Hard'];
    const blooms = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

    let allQuestions = [];
    
    for (let u = 0; u < unitsData.length; u++) {
      const unitName = unitsData[u];
      const topics = unitTopics[u];
      
      for (let i = 1; i <= 20; i++) {
        // Randomize distributions but ensure variation
        const topic = topics[i % topics.length];
        const qType = types[i % types.length];
        const diff = diffs[i % diffs.length];
        const bloom = blooms[i % blooms.length];
        
        let marks = 2;
        if (qType === 'MCQ') marks = 1;
        if (qType === 'Short Answer') marks = [2, 3][i % 2];
        if (qType === 'Numerical') marks = [5, 10][i % 2];
        if (qType === 'Long Answer') marks = [10, 15][i % 2];

        const qCode = `CS301-U${u + 1}-Q${i.toString().padStart(3, '0')}`;
        
        let qText = `Explain the concept of ${topic} in detail.`;
        if (qType === 'MCQ') qText = `Which of the following is true about ${topic}? (a) ... (b) ... (c) ... (d) ...`;
        if (qType === 'Numerical') qText = `Calculate the optimal execution cost for a query involving ${topic}. Assume disk blocks M=100.`;
        if (bloom === 'Analyze') qText = `Analyze the performance trade-offs of using ${topic} in a highly concurrent environment.`;
        if (bloom === 'Evaluate') qText = `Evaluate the statement: "${topic} is obsolete in modern distributed systems." Justify your answer.`;
        if (bloom === 'Create') qText = `Design a relational schema utilizing ${topic} for a university management system.`;

        allQuestions.push({
          question_code: qCode,
          subject_id: subject.id,
          unit: unitName,
          question_text: qText,
          question_type: qType,
          blooms_level: bloom,
          difficulty_level: diff,
          marks: marks,
          status: 'Active',
          created_by: null
        });
      }
    }

    console.log(`📤 Sending ${allQuestions.length} questions to bulk insertion API...`);
    const qRes = await fetch(`${API_BASE}/questions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: allQuestions })
    });

    const qData = await qRes.json();
    if (qRes.ok) {
      console.log(`✅ Success: ${qData.message} (${qData.count} inserted)`);
    } else {
      console.error('❌ Error inserting questions:', qData.error);
    }

    console.log('🎉 Data seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
