const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zai827--',
    database: 'university_evaluation_system'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM universities WHERE name LIKE ? OR code = ?', ['%UPES%', 'UPES']);
    if (rows.length > 0) {
      console.log('Found UPES:', rows[0].name, 'Current Code:', rows[0].code);
      if (!rows[0].code || rows[0].code.startsWith('UNI') || rows[0].code.toLowerCase() === 'uems' || rows[0].code.toLowerCase() !== 'upes') {
        console.log('Updating UPES code to UPES...');
        await connection.execute('UPDATE universities SET code = ? WHERE id = ?', ['UPES', rows[0].id]);
        console.log('Updated.');
      } else {
        console.log('Current code is already:', rows[0].code);
      }
    } else {
      console.log('UPES not found. Inserting UPES...');
      await connection.execute('INSERT INTO universities (name, code, status) VALUES (?, ?, ?)', ['UPES', 'UPES', 'active']);
      console.log('UPES inserted.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
main();
