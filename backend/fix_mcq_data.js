const db = require('./db');

const q1 = `UPDATE questions SET option_a = 'Consistency, Availability, Partition Tolerance', option_b = 'Atomicity, Consistency, Isolation, Durability', option_c = 'Create, Apply, Perform', option_d = 'Client, API, Process', correct_answer = 'A' WHERE question_text LIKE '%CAP Theorem%' AND question_type = 'MCQ'`;

const q2 = `UPDATE questions SET option_a = 'It primarily improves data retrieval performance', option_b = 'It is a deprecated concept in modern distributed systems', option_c = 'It strictly ensures absolute data consistency at all times', option_d = 'It provides a framework for scaling databases horizontally', correct_answer = 'A' WHERE question_type = 'MCQ' AND option_a IS NULL`;

db.query(q1, (err, res1) => {
    if (err) console.error(err);
    console.log('CAP Theorem updated:', res1.affectedRows);
    db.query(q2, (err, res2) => {
        if (err) console.error(err);
        console.log('Rest updated:', res2.affectedRows);
        db.end();
    });
});
