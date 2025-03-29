// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(bodyParser.json());

// Initialize the database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS saves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_raised REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Endpoint to add a donation
app.post('/donate', (req, res) => {
    const { amount } = req.body;
    if (amount && amount > 0) {
        db.run('INSERT INTO donations (amount) VALUES (?)', [amount], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
    } else {
        res.status(400).json({ error: 'Invalid donation amount' });
    }
});

// Endpoint to save the total raised amount
app.post('/save', (req, res) => {
    const { total_raised } = req.body;
    if (total_raised && total_raised > 0) {
        db.run('INSERT INTO saves (total_raised) VALUES (?)', [total_raised], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
    } else {
        res.status(400).json({ error: 'Invalid total raised amount' });
    }
});

// Endpoint to get the total raised amount
app.get('/total-raised', (req, res) => {
    db.get('SELECT SUM(amount) AS total_raised FROM donations', (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ total_raised: row.total_raised || 0 });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
