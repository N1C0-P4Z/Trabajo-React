const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'auth.db');

// Create database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database tables
function initDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create index on username
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_username ON users(username);
  `);

  console.log('✅ SQLite database initialized');
}

// Seed initial user if none exists
function seedUser() {
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  
  if (!existingUser) {
    // Password: 'secret123' hashed with bcrypt
    const bcrypt = require('bcrypt');
    const hash = bcrypt.hashSync('secret123', 10);
    
    const insert = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    insert.run('admin', hash);
    
    console.log('✅ Default user created: admin / secret123');
  }
}

// Initialize on module load
initDatabase();
seedUser();

module.exports = db;
