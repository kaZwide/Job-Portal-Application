const Database = require("better-sqlite3");
const db = new Database("jobportal.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const jobCount = db.prepare("SELECT COUNT(*) AS count FROM jobs").get();

if (jobCount.count === 0) {
  const insertJob = db.prepare(`
    INSERT INTO jobs (title, company, location, description)
    VALUES (?, ?, ?, ?)
  `);

  insertJob.run(
    "Junior Web Developer",
    "Tech Solutions",
    "Johannesburg",
    "Assist with developing and maintaining web applications."
  );

  insertJob.run(
    "IT Support Technician",
    "Digital Systems",
    "Cape Town",
    "Provide technical support and troubleshoot IT issues."
  );

  insertJob.run(
    "Graduate Software Developer",
    "Future Tech",
    "Remote",
    "Join our development team and work on modern software projects."
  );

  console.log("Sample jobs added to database.");
}
db.prepare(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'jobseeker',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();
module.exports = db;