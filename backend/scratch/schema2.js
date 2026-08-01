const mysql = require('mysql2/promise');
async function run() {
    const conn = await mysql.createConnection({host: 'localhost', user: 'root', password: 'zai827--', database: 'university_evaluation_system'});
    const [rows] = await conn.query('DESCRIBE paper_sections');
    console.log(rows);
    await conn.end();
}
run();
