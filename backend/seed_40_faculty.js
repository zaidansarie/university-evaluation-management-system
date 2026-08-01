const mysql = require('mysql2/promise');
const http = require('http');

const firstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Anika', 'Navya', 'Aryan', 'Rohan', 'Riya', 'Kavya', 'Dhruv', 'Ayaan', 'Ishaan', 'Mira', 'Neha', 'Pooja', 'Rahul', 'Aditi', 'Pranav', 'Rishabh', 'Sneha', 'Tanvi', 'Siddharth', 'Varun', 'Yash', 'Zoya', 'Aditya', 'Arjun', 'Isha', 'Karan', 'Kriti', 'Meera', 'Nikhil', 'Priya', 'Ravi', 'Ritu', 'Sameer'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Kapoor', 'Singh', 'Mehta', 'Chopra', 'Joshi', 'Patel', 'Reddy', 'Rao', 'Das', 'Sen', 'Bose', 'Chakraborty', 'Banerjee', 'Iyer', 'Nair', 'Pillai', 'Menon', 'Kumar', 'Mishra', 'Tiwari', 'Pandey', 'Yadav', 'Ahluwalia', 'Chauhan', 'Rajput'];

function getRandomName() {
    const f = firstNames[Math.floor(Math.random() * firstNames.length)];
    const l = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${f} ${l}`;
}

async function postFaculty(facultyData, universityId) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(facultyData);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/faculty',
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

    const distribution = [
        { department: 'Computer Science Engineering', count: 12 },
        { department: 'Mechanical Engineering', count: 6 },
        { department: 'Civil Engineering', count: 5 },
        { department: 'Electronics Engineering', count: 5 },
        { department: 'Electrical Engineering', count: 4 },
        { department: 'Chemical Engineering', count: 3 },
        { department: 'Management', count: 2 },
        { department: 'Mathematics', count: 1 },
        { department: 'Physics', count: 1 },
        { department: 'English', count: 1 }
    ];

    let totalSuccess = 0;
    
    for (let i = 0; i < distribution.length; i++) {
        const batch = distribution[i];
        console.log(`\nGenerating ${batch.count} faculty for: ${batch.department}...`);
        
        for (let j = 1; j <= batch.count; j++) {
            const hasEmail = Math.random() > 0.5;
            const name = getRandomName();
            const email = hasEmail ? `${name.replace(/\s+/g, '.').toLowerCase()}@upes.edu.in` : '';
            
            const faculty = {
                name: name,
                email: email,
                department: batch.department,
                phone_number: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                status: 'Active'
            };

            try {
                const res = await postFaculty(faculty, universityId);
                console.log(`[${batch.department}] ${j}/${batch.count} - Success: ${faculty.name} -> User: ${res.credentials.username}`);
                totalSuccess++;
            } catch (err) {
                console.error(`[${batch.department}] ${j}/${batch.count} - Failed for ${faculty.name}:`, err.message);
            }
        }
    }
    
    console.log(`\nDone! Successfully created ${totalSuccess}/40 faculty via API.`);
}

main().catch(console.error);
