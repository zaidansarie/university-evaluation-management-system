const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  try {
    await connection.execute('UPDATE users SET username = ? WHERE email = ?', ['admin', 'upes@gmail.com']);
    console.log('UPES Admin username updated to "admin"');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
main();
