const db = require('../db');

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const special = '!@#$%^&*()_+';
  
  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += num[Math.floor(Math.random() * num.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  const length = Math.floor(Math.random() * 5) + 8; // 8-12 characters
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

function generateStudentUsername(year, course, rollNumber) {
  // e.g. 2026cse001
  const yr = year || new Date().getFullYear();
  const crs = (course || 'std').toLowerCase().replace(/\s+/g, '');
  let num = '000';
  if (rollNumber) {
    // try to extract digits from roll number
    const match = rollNumber.toString().match(/\d+/);
    if (match) {
      num = match[0].padStart(3, '0');
    }
  } else {
    num = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }
  return `${yr}${crs}${num}`.toLowerCase();
}

function generateFacultyUsername(name) {
  // e.g. amit.sharma
  if (!name) return 'faculty' + Math.floor(Math.random() * 10000);
  const parts = name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return parts[0] + Math.floor(Math.random() * 1000);
}

// Ensure uniqueness
async function getUniqueUsername(baseUsername, table) {
  return new Promise((resolve, reject) => {
    let query = `SELECT username FROM ${table} WHERE username = ?`;
    db.query(query, [baseUsername], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(baseUsername);
      
      // Collision found, append a random number
      const randomSuffix = Math.floor(Math.random() * 10000);
      resolve(`${baseUsername}${randomSuffix}`);
    });
  });
}

module.exports = {
  generatePassword,
  generateStudentUsername,
  generateFacultyUsername,
  getUniqueUsername
};
