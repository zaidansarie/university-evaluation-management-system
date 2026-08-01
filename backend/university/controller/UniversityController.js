const University = require('../model/University');
const bcrypt = require('bcryptjs');
const db = require('../../db');

class UniversityController {
  static async createUniversity(req, res) {
    try {
      const data = { ...req.body };
      
      // Generate a unique University Code if not provided
      if (!data.code) {
        const lastUni = await new Promise((resolve) => {
          db.query('SELECT id FROM universities ORDER BY id DESC LIMIT 1', (err, results) => {
            if (err || results.length === 0) resolve(0);
            else resolve(results[0].id);
          });
        });
        const nextId = lastUni + 1;
        data.code = `UNI${String(nextId).padStart(4, '0')}`;
      }

      // Create the university
      const university = await University.create(data);
      
      // Automatically create a default University Admin account
      const salt = await bcrypt.genSalt(10);
      const tempPassword = `Admin@${data.code}1`; // Meet strict policy
      const password_hash = await bcrypt.hash(tempPassword, salt);
      const email = data.email || `admin@${data.code.toLowerCase()}.edu`;
      const name = `${data.name} Admin`;
      const username = `admin.${data.code.toLowerCase()}`;

      const insertQuery = `
        INSERT INTO users (name, username, email, password_hash, role, university_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [name, username, email, password_hash, 'admin', university.id];
      
      await new Promise((resolve, reject) => {
        db.query(insertQuery, values, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Optionally attach the temp password in response so the frontend can display it in a success message
      university.adminEmail = email;
      university.adminUsername = username;
      university.tempPassword = tempPassword;

      res.status(201).json(university);
    } catch (error) {
      console.error('Error creating university:', error);
      res.status(500).json({ error: 'Failed to create university' });
    }
  }

  static async getUniversities(req, res) {
    try {
      const universities = await University.findAll();
      // Fetch admin info for each university
      const universitiesWithAdmins = await Promise.all(universities.map(async (u) => {
        const adminEmail = await new Promise((resolve) => {
          db.query('SELECT email, name FROM users WHERE university_id = ? AND role = "admin" LIMIT 1', [u.id], (err, results) => {
            if (err || results.length === 0) resolve(null);
            else resolve(results[0].email);
          });
        });
        return { ...u, admin_email: adminEmail };
      }));
      res.json(universitiesWithAdmins);
    } catch (error) {
      console.error('Error fetching universities:', error);
      res.status(500).json({ error: 'Failed to fetch universities' });
    }
  }

  static async getUniversityById(req, res) {
    try {
      const university = await University.findById(req.params.id);
      if (!university) {
        return res.status(404).json({ error: 'University not found' });
      }
      res.json(university);
    } catch (error) {
      console.error('Error fetching university:', error);
      res.status(500).json({ error: 'Failed to fetch university' });
    }
  }

  static async updateUniversity(req, res) {
    try {
      await University.update(req.params.id, req.body);
      res.json({ message: 'University updated successfully' });
    } catch (error) {
      console.error('Error updating university:', error);
      res.status(500).json({ error: 'Failed to update university' });
    }
  }

  static async deleteUniversity(req, res) {
    try {
      // First delete associated users to be safe, though ON DELETE CASCADE or SET NULL might exist
      await new Promise((resolve, reject) => {
        db.query('DELETE FROM users WHERE university_id = ?', [req.params.id], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      await University.delete(req.params.id);
      res.json({ message: 'University deleted successfully' });
    } catch (error) {
      console.error('Error deleting university:', error);
      res.status(500).json({ error: 'Failed to delete university' });
    }
  }
}

module.exports = UniversityController;
