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
}

module.exports = NotificationService;
