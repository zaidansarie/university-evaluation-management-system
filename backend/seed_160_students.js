const mysql = require('mysql2/promise');
const http = require('http');

const firstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Anika', 'Navya', 'Aryan', 'Rohan', 'Riya', 'Kavya', 'Dhruv', 'Ayaan', 'Ishaan', 'Mira', 'Neha', 'Pooja', 'Rahul', 'Aditi', 'Pranav', 'Rishabh', 'Sneha', 'Tanvi', 'Siddharth', 'Varun', 'Yash', 'Zoya', 'Aditya', 'Arjun', 'Isha', 'Karan', 'Kriti', 'Meera', 'Nikhil', 'Priya', 'Ravi', 'Ritu', 'Sameer'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Kapoor', 'Singh', 'Mehta', 'Chopra', 'Joshi', 'Patel', 'Reddy', 'Rao', 'Das', 'Sen', 'Bose', 'Chakraborty', 'Banerjee', 'Iyer', 'Nair', 'Pillai', 'Menon', 'Kumar', 'Mishra', 'Tiwari', 'Pandey', 'Yadav', 'Ahluwalia', 'Chauhan', 'Rajput'];

function getRandomName() {
    const f = firstNames[Math.floor(Math.random() * firstNames.length)];
    const l = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${f} ${l}`;
}

async function postStudent(studentData, universityId) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(studentData);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/students',
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
    console.log("Connecting to database to get UPES ID...");
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'zai827--',
        database: 'university_evaluation_system'
    });

    const [rows] = await connection.execute("SELECT id FROM universities WHERE code = 'UPES'");
    if (rows.length === 0) {
        console.error("UPES not found");
        process.exit(1);
    }
    const universityId = rows[0].id;
    await connection.end();

    const batches = [
        { course: 'B.Tech', program: 'Computer Science Engineering', school: 'School of Computer Science', semester: '1', prefix: 'BT' },
        { course: 'B.Sc', program: 'Electronics Engineering', school: 'School of Engineering', semester: '3', prefix: 'BS' },
        { course: 'MBA', program: 'Mechanical Engineering', school: 'School of Business', semester: '1', prefix: 'MB' },
        { course: 'MCA', program: 'Civil Engineering', school: 'School of Computer Science', semester: '3', prefix: 'MC' }
    ];

    let totalSuccess = 0;
    
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\nGenerating 40 students for Batch ${i+1}: ${batch.course} - ${batch.program}...`);
        
        for (let j = 1; j <= 40; j++) {
            const rollNum = `2026${batch.prefix}${String(j).padStart(3, '0')}`;
            const student = {
                roll_number: rollNum,
                name: getRandomName(),
                email: `${rollNum.toLowerCase()}@upes.edu.in`,
                course: batch.course,
                program: batch.program,
                school: batch.school,
                semester: batch.semester,
                section: 'A',
                phone_number: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                status: 'Active'
            };

            try {
                const res = await postStudent(student, universityId);
                console.log(`[Batch ${i+1}] ${j}/40 - Success: ${student.name} (${student.roll_number}) -> User: ${res.credentials.username}`);
                totalSuccess++;
            } catch (err) {
                console.error(`[Batch ${i+1}] ${j}/40 - Failed for ${student.roll_number}:`, err.message);
            }
        }
    }
    
    console.log(`\nDone! Successfully created ${totalSuccess}/160 students via API.`);
}

main().catch(console.error);
