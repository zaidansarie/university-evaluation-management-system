const mysql = require('mysql2/promise');
const http = require('http');

const batches = [
  {
    course: "B.Tech", program: "Computer Science Engineering", school: "School of Computer Science", semester: "1",
    subjects: [
      { subject_code: "MAT101", subject_name: "Mathematics-I", credits: 4, department: "Mathematics", units: ["Calculus", "Linear Algebra", "Differential Equations", "Probability", "Statistics"] },
      { subject_code: "CSE101", subject_name: "Programming in C", credits: 4, department: "Computer Science Engineering", units: ["Introduction to Programming", "Variables, Data Types and Operators", "Control Statements", "Functions and Arrays", "Pointers and File Handling"] },
      { subject_code: "CSE102", subject_name: "Digital Logic", credits: 4, department: "Computer Science Engineering", units: ["Number Systems", "Boolean Algebra", "Combinational Logic", "Sequential Logic", "Memory Devices"] },
      { subject_code: "CSE103", subject_name: "Computer Fundamentals", credits: 4, department: "Computer Science Engineering", units: ["History of Computers", "Hardware and Software", "Operating Systems Basics", "Networking Basics", "Internet and Web"] },
      { subject_code: "PHY101", subject_name: "Engineering Physics", credits: 4, department: "Physics", units: ["Mechanics", "Optics", "Electromagnetism", "Quantum Mechanics Basics", "Solid State Physics"] },
      { subject_code: "ENG101", subject_name: "Communication Skills", credits: 2, department: "English", units: ["Grammar Basics", "Reading Comprehension", "Writing Skills", "Verbal Communication", "Presentation Skills"] }
    ]
  },
  {
    course: "B.Sc", program: "Electronics Engineering", school: "School of Engineering", semester: "3",
    subjects: [
      { subject_code: "ECE301", subject_name: "Analog Electronics", credits: 4, department: "Electronics Engineering", units: ["Semiconductor Diodes", "BJT Amplifiers", "FET and MOSFET", "Feedback Amplifiers", "Oscillators"] },
      { subject_code: "ECE302", subject_name: "Digital Electronics", credits: 4, department: "Electronics Engineering", units: ["Logic Gates", "K-Maps", "Flip Flops", "Counters", "Shift Registers"] },
      { subject_code: "ECE303", subject_name: "Network Theory", credits: 4, department: "Electronics Engineering", units: ["Network Theorems", "Transient Analysis", "Two-Port Networks", "Network Functions", "Filters"] },
      { subject_code: "ECE304", subject_name: "Signals and Systems", credits: 4, department: "Electronics Engineering", units: ["Continuous-Time Signals", "LTI Systems", "Fourier Series", "Fourier Transform", "Z-Transform"] },
      { subject_code: "ECE305", subject_name: "Microprocessors", credits: 4, department: "Electronics Engineering", units: ["8085 Architecture", "Instruction Set", "Assembly Programming", "Interfacing", "Microcontrollers Intro"] },
      { subject_code: "ECE306", subject_name: "Electronic Measurements", credits: 2, department: "Electronics Engineering", units: ["Measurement Errors", "Bridges", "Oscilloscopes", "Transducers", "Data Acquisition"] }
    ]
  },
  {
    course: "MBA", program: "Mechanical Engineering", school: "School of Business", semester: "1",
    subjects: [
      { subject_code: "MBA101", subject_name: "Principles of Management", credits: 4, department: "Management", units: ["Management Theories", "Planning", "Organizing", "Leading", "Controlling"] },
      { subject_code: "MBA102", subject_name: "Financial Accounting", credits: 4, department: "Management", units: ["Accounting Basics", "Journal and Ledger", "Trial Balance", "Final Accounts", "Financial Statement Analysis"] },
      { subject_code: "MBA103", subject_name: "Business Economics", credits: 4, department: "Management", units: ["Microeconomics Intro", "Demand Analysis", "Production and Cost", "Market Structures", "Macroeconomics Intro"] },
      { subject_code: "MBA104", subject_name: "Organizational Behaviour", credits: 4, department: "Management", units: ["OB Introduction", "Individual Behaviour", "Group Dynamics", "Motivation", "Leadership Styles"] },
      { subject_code: "MBA105", subject_name: "Marketing Management", credits: 4, department: "Management", units: ["Marketing Concepts", "Consumer Behaviour", "Product Life Cycle", "Pricing Strategies", "Promotion Mix"] },
      { subject_code: "MBA106", subject_name: "Business Communication", credits: 2, department: "Management", units: ["Communication Process", "Written Communication", "Oral Presentations", "Corporate Etiquette", "Negotiation Skills"] }
    ]
  },
  {
    course: "MCA", program: "Civil Engineering", school: "School of Computer Science", semester: "3",
    subjects: [
      { subject_code: "CIV301", subject_name: "Structural Analysis", credits: 4, department: "Civil Engineering", units: ["Determinacy and Stability", "Trusses", "Beams and Frames", "Influence Lines", "Matrix Methods"] },
      { subject_code: "CIV302", subject_name: "Concrete Technology", credits: 4, department: "Civil Engineering", units: ["Cement and Aggregates", "Fresh Concrete", "Hardened Concrete", "Mix Design", "Special Concretes"] },
      { subject_code: "CIV303", subject_name: "Surveying", credits: 4, department: "Civil Engineering", units: ["Chain Surveying", "Compass Surveying", "Levelling", "Theodolite", "Modern Surveying Tools"] },
      { subject_code: "CIV304", subject_name: "Transportation Engineering", credits: 4, department: "Civil Engineering", units: ["Highway Alignment", "Geometric Design", "Pavement Materials", "Traffic Engineering", "Railway Engineering Basics"] },
      { subject_code: "CIV305", subject_name: "Environmental Engineering", credits: 4, department: "Civil Engineering", units: ["Water Demand", "Water Quality", "Water Treatment", "Wastewater Characteristics", "Wastewater Treatment"] },
      { subject_code: "CIV306", subject_name: "Geotechnical Engineering", credits: 4, department: "Civil Engineering", units: ["Soil Properties", "Soil Classification", "Permeability", "Consolidation", "Shear Strength"] }
    ]
  }
];

async function postSubject(subjectData, universityId) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(subjectData);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/subjects',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'x-university-id': universityId,
                'x-user-role': 'admin'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log("Connecting to database...");
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'zai827--',
        database: 'university_evaluation_system'
    });

    const [uniRows] = await connection.execute("SELECT id FROM universities WHERE code = 'UPES'");
    if (uniRows.length === 0) {
        console.error("UPES not found");
        process.exit(1);
    }
    const universityId = uniRows[0].id;

    // Get all faculty for this university
    const [facultyRows] = await connection.execute("SELECT id, name, department FROM faculty");
    
    // Group faculty by department
    const facultyByDept = {};
    facultyRows.forEach(f => {
        if (!facultyByDept[f.department]) facultyByDept[f.department] = [];
        facultyByDept[f.department].push(f);
    });

    let totalSuccess = 0;
    
    for (const batch of batches) {
        console.log(`\nProcessing Batch: ${batch.course} - ${batch.program} (Sem ${batch.semester})`);
        
        for (const sub of batch.subjects) {
            // Find a faculty member from the matching department
            let assignedFacultyId = null;
            if (facultyByDept[sub.department] && facultyByDept[sub.department].length > 0) {
                // Pick a random faculty member from that department
                const facultyList = facultyByDept[sub.department];
                const randFaculty = facultyList[Math.floor(Math.random() * facultyList.length)];
                assignedFacultyId = randFaculty.id;
            } else {
                console.warn(`WARNING: No faculty found for department '${sub.department}'. Assigning first available or null.`);
                assignedFacultyId = facultyRows.length > 0 ? facultyRows[0].id : null;
            }
            
            const subjectPayload = {
                subject_code: sub.subject_code,
                subject_name: sub.subject_name,
                course: batch.course,
                program: batch.program,
                school: batch.school,
                semester: batch.semester,
                credits: sub.credits,
                faculty_id: assignedFacultyId,
                status: 'Active',
                units: sub.units.map(u => ({ unit_name: `Unit ${sub.units.indexOf(u) + 1} - ${u}` }))
            };

            try {
                const res = await postSubject(subjectPayload, universityId);
                console.log(`Success: ${sub.subject_code} - ${sub.subject_name} (Assigned to Faculty ID: ${assignedFacultyId})`);
                totalSuccess++;
            } catch (err) {
                console.error(`Failed to create ${sub.subject_code}: ${err.message}`);
            }
        }
    }
    
    await connection.end();
    console.log(`\nDone! Successfully created ${totalSuccess}/24 subjects via API.`);
}

main().catch(console.error);
