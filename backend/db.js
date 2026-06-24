const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'zai827--',
  database: 'university_evaluation_system'
});

// Connect to MySQL and handle success or error messages
connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to the MySQL database:', err.message);
    console.error('Make sure XAMPP/MySQL is running and the database exists.');
    return;
  }
  console.log('✅ Successfully connected to the MySQL database.');
});

// Export the connection so it can be used in other files
module.exports = connection;
