const db = require('../db');

class NotificationService {
  /**
   * Create a single notification
   */
  static createNotification(studentId, type, title, message, relatedId = null, relatedModule = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (student_id, type, title, message, related_id, related_module)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(query, [studentId, type, title, message, relatedId, relatedModule], (err, results) => {
        if (err) {
          console.error('Error creating notification:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Create notifications for multiple students (bulk insert)
   */
  static createBulkNotifications(studentIds, type, title, message, relatedId = null, relatedModule = null) {
    return new Promise((resolve, reject) => {
      if (!studentIds || studentIds.length === 0) {
        return resolve({ affectedRows: 0 });
      }

      const values = studentIds.map(studentId => [
        studentId, type, title, message, relatedId, relatedModule
      ]);

      const query = `
        INSERT INTO notifications (student_id, type, title, message, related_id, related_module)
        VALUES ?
      `;

      db.query(query, [values], (err, results) => {
        if (err) {
          console.error('Error creating bulk notifications:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Create an admin notification
   */
  static createAdminNotification(adminId, type, title, message, relatedId = null, relatedModule = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (admin_id, type, title, message, related_id, related_module)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(query, [adminId, type, title, message, relatedId, relatedModule], (err, results) => {
        if (err) {
          console.error('Error creating admin notification:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Create a faculty notification
   */
  static createFacultyNotification(facultyId, type, title, message, relatedId = null, relatedModule = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (faculty_id, type, title, message, related_id, related_module)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(query, [facultyId, type, title, message, relatedId, relatedModule], (err, results) => {
        if (err) {
          console.error('Error creating faculty notification:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = NotificationService;
