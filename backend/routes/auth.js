const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND status = "active"';
  
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length === 0) {
      // User not found or not active
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    const user = results[0];
    
    try {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      
      // Successfully authenticated
      // Return user data (excluding password_hash)
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university_id: user.university_id
      };
      
      res.json({ success: true, user: userData });
      
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

module.exports = router;
