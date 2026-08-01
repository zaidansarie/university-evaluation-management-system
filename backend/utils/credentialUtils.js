const db = require('../db');

const PASSWORD_POLICY = {
  minLength: 8,
  specialChars: '@#$%&*!?_-'
};

function validatePassword(password) {
  const p = password || '';
  const minLength = p.length >= PASSWORD_POLICY.minLength;
  const uppercase = /[A-Z]/.test(p);
  const lowercase = /[a-z]/.test(p);
  const number = /[0-9]/.test(p);
  const special = new RegExp(`[${PASSWORD_POLICY.specialChars}]`).test(p);
  const noSpaces = !/\s/.test(p);
  return minLength && uppercase && lowercase && number && special && noSpaces;
}

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const special = PASSWORD_POLICY.specialChars;
  const chars = upper + lower + num + special;
  
  let password = '';
  // Ensure at least one of each required type
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
  getUniqueUsername,
  validatePassword
};
