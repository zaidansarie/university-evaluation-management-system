const db = require('./db');
const createTable = `
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
db.query(createTable, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Courses table created.');
    db.query('SELECT * FROM courses', (err, results) => {
        if (results.length === 0) {
            db.query(`INSERT INTO courses (course_name, status) VALUES ('B.Tech', 'Active')`, (err) => {
                if (err) console.error(err);
                else console.log('Seeded B.Tech');
                process.exit(0);
            });
        } else {
            console.log('Courses table already has records.');
            process.exit(0);
        }
    });
});
