const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const db = new sqlite3.Database("./product_management.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create Tables
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      role TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      feature TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS product_backlog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feature TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS sprint (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feature TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      user_story TEXT,
      acceptance_criteria TEXT,
      story_type TEXT,
      assigned_to TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Add sample users
  db.run(`INSERT OR IGNORE INTO users (email, role) VALUES ('bdm1@zeraki.com', 'BDM')`);
  db.run(`INSERT OR IGNORE INTO users (email, role) VALUES ('pm1@zeraki.com', 'Product Manager')`);
});

// Authenticate User
app.post("/login", (req, res) => {
  const { email } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      res.status(500).json({ error: "Failed to authenticate user." });
    } else if (row) {
      res.json({ email: row.email, role: row.role });
    } else {
      res.status(401).json({ error: "Unauthorized. User not found." });
    }
  });
});

// Fetch Users
app.get("/users", (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      res.status(500).json({ error: "Failed to fetch users." });
    } else if (rows) {
      res.json(rows);
    } else {
      res.status(401).json({ error: "Unauthorized." });
    }
  });
});

// Submit Feedback
app.post("/feedback", (req, res) => {
  const { product, feature, description } = req.body;
  const sql = `INSERT INTO feedback (product, feature, description) VALUES (?, ?, ?)`;

  db.run(sql, [product, feature, description], function (err) {
    if (err) {
      console.error("Error inserting feedback:", err.message);
      res.status(500).json({ error: "Failed to submit feedback." });
    } else {
      res.status(201).json({ message: "Feedback submitted successfully.", id: this.lastID });
    }
  });
});

// Promote to Product Backlog
app.post("/product-backlog", (req, res) => {
  const { feature, tech_stack } = req.body;
  const sql = `INSERT INTO product_backlog (feature, tech_stack) VALUES (?, ?)`;

  db.run(sql, [feature, tech_stack], function (err) {
    if (err) {
      console.error("Error promoting to product backlog:", err.message);
      res.status(500).json({ error: "Failed to promote to product backlog." });
    } else {
      res.status(201).json({ message: "Promoted to product backlog.", id: this.lastID });
    }
  });
});

// Move to Sprint
app.post("/sprint", (req, res) => {
  const { feature, tech_stack, user_story, acceptance_criteria, story_type, assigned_to, status } = req.body;
  const sql = `INSERT INTO sprint (feature, tech_stack, user_story, acceptance_criteria, story_type, assigned_to, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [feature, tech_stack, user_story, acceptance_criteria, story_type, assigned_to, status],
    function (err) {
      if (err) {
        console.error("Error moving to sprint:", err.message);
        res.status(500).json({ error: "Failed to move to sprint." });
      } else {
        res.status(201).json({ message: "Moved to sprint successfully.", id: this.lastID });
      }
    }
  );
});

// Fetch Feedback
app.get("/feedback", (req, res) => {
  db.all(`SELECT * FROM feedback ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching feedback:", err.message);
      res.status(500).json({ error: "Failed to fetch feedback." });
    } else {
      res.json(rows);
    }
  });
});

// Fetch Product Backlog
app.get("/product-backlog", (req, res) => {
  db.all(`SELECT * FROM product_backlog ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching product backlog:", err.message);
      res.status(500).json({ error: "Failed to fetch product backlog." });
    } else {
      res.json(rows);
    }
  });
});

// Fetch Sprint
app.get("/sprint", (req, res) => {
  db.all(`SELECT * FROM sprint ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching sprint:", err.message);
      res.status(500).json({ error: "Failed to fetch sprint." });
    } else {
      res.json(rows);
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
