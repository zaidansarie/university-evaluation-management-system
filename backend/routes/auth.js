const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { validatePassword } = require('../utils/credentialUtils');

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password, universityCode, isSuperAdminLogin } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const authenticateUser = (query, params) => {
    db.query(query, params, async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (results.length === 0) {
        // User not found or not active
        return res.status(401).json({ error: 'Invalid username or password.' });
      }
      
      const user = results[0];
      
      try {
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid username or password.' });
        }
        
        // Successfully authenticated
        const userData = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          university_id: user.university_id,
          universityName: user.university_name,
          first_login: !!user.first_login
        };
        
        res.json({ success: true, user: userData, requiresPasswordChange: !!user.first_login });
        
      } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };

  if (isSuperAdminLogin) {
    const query = `
      SELECT u.*, uni.name AS university_name 
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      WHERE (u.email = ? OR u.username = ?) AND u.status = "active" AND u.role = 'super-admin'
    `;
    authenticateUser(query, [email, email]);
  } else {
    if (!universityCode) {
      return res.status(400).json({ error: 'University Code is required' });
    }
    const uniQuery = 'SELECT id FROM universities WHERE code = ? AND status = "active"';
    db.query(uniQuery, [universityCode], (err, uniResults) => {
      if (err) {
        console.error('Error fetching university:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (uniResults.length === 0) {
        return res.status(404).json({ error: 'University not found.' });
      }
      
      const uniId = uniResults[0].id;
      const query = `
        SELECT u.*, uni.name AS university_name 
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        WHERE (u.email = ? OR u.username = ?) AND u.status = "active" AND u.university_id = ?
      `;
      authenticateUser(query, [email, email, uniId]);
    });
  }
});

// Change Password (e.g. forced on first login)
router.post('/change-password', (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'User ID, old password, and new password are required' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ error: 'New password does not meet the strict security requirements.' });
  }

  // Fetch user to verify old password
  db.query('SELECT password_hash FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = results[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    db.query('UPDATE users SET password_hash = ?, plain_password = ?, first_login = 0 WHERE id = ?', [newHash, newPassword, userId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to update password' });
      res.json({ success: true, message: 'Password updated successfully' });
    });
  });
});

module.exports = router;
