const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  try {
    const [userRows] = await connection.execute('SELECT username, email, role, plain_password FROM users WHERE role = "super-admin"');
    console.log('Super Admin details:', userRows);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
main();
