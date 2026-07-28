const db = require('../../db');

class University {
  static create(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO universities 
        (name, code, email, phone, website, address, city, state, country, academic_year, logo, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        data.name, data.code, data.email, data.phone, data.website, 
        data.address, data.city, data.state, data.country, 
        data.academic_year, data.logo, data.status || 'active'
      ];
      
      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve({ id: results.insertId, ...data });
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM universities', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM universities WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      // Very basic update builder for the foundation phase
      const keys = Object.keys(data);
      if (keys.length === 0) return resolve(null);
      
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = Object.values(data);
      values.push(id);
      
      const query = `UPDATE universities SET ${setClause} WHERE id = ?`;
      
      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM universities WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = University;
