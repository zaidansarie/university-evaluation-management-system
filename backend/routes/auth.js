const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { validatePassword } = require('../utils/credentialUtils');

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password, universityCode } = req.body;
  
  if (!email || !password || !universityCode) {
    return res.status(400).json({ error: 'Platform/University Code, Username, and Password are required' });
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
          universityName: user.university_name
        };
        
        if (userData.role === 'faculty') {
          db.query('SELECT id FROM faculty WHERE email = ? LIMIT 1', [userData.email], (err, facRes) => {
            if (!err && facRes.length > 0) {
              userData.faculty_id = facRes[0].id;
            }
            res.json({ success: true, user: userData });
          });
        } else {
          res.json({ success: true, user: userData });
        }
        
      } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  };

  if (universityCode === 'PLATFORM') {
    const query = `
      SELECT u.*, uni.name AS university_name 
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      WHERE (u.email = ? OR u.username = ?) AND u.status = "active" AND u.role = 'super-admin'
    `;
    authenticateUser(query, [email, email]);
  } else {
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



module.exports = router;
