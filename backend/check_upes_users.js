const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  try {
    const [uniRows] = await connection.execute('SELECT id, code FROM universities WHERE code = ?', ['UPES']);
    if (uniRows.length > 0) {
      const upesId = uniRows[0].id;
      const [userRows] = await connection.execute('SELECT username, email, role, plain_password FROM users WHERE university_id = ?', [upesId]);
      console.log('UPES Users:', userRows.length);
      console.log(userRows.slice(0, 5));
    } else {
      console.log('UPES not found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
main();
