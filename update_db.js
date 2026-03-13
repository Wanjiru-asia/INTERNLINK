const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const queries = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS technical_field VARCHAR(100)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS tools TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS opportunity_type VARCHAR(50)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS work_preference VARCHAR(50)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS relocation VARCHAR(10)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_level VARCHAR(100)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS institution VARCHAR(150)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255)"
];

async function runQueries() {
    for (const sql of queries) {
        try {
            await db.promise().query(sql);
            console.log(`Executed: ${sql}`);
        } catch (err) {
            console.error(`Error executing ${sql}:`, err.message);
        }
    }
    db.end();
}

runQueries();
