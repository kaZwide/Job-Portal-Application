const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const db = require("./database");
const app = express();

 

app.use(express.json());
app.use(
  session({
    secret: "job-portal-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
);

app.get("/admin.html", (req, res) => {
    

    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).send("Administrator access denied.");
    }

    res.sendFile(path.join(__dirname, "admin.html"));
});

app.use(express.static(__dirname));




const PORT = 3000;

app.use(express.json());


// Get all jobs
app.get("/api/jobs", (req, res) => {
  try {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY id DESC").all();
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load jobs." });
  }
});
// Add a new job
app.post("/api/jobs", (req, res) => {
  try {
    const { title, company, location, description } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        message: "Please complete all job fields."
      });
    }

    const result = db.prepare(`
      INSERT INTO jobs (title, company, location, description)
      VALUES (?, ?, ?, ?)
    `).run(title, company, location, description);

    const newJob = db.prepare(
      "SELECT * FROM jobs WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
      message: "Job posted successfully!",
      job: newJob
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to post job."
    });
  }
});
// Submit a job application
app.post("/api/applications", (req, res) => {
  try {
    const {
      job_id,
      applicant_name,
      email,
      phone,
      cover_letter
    } = req.body;

    if (!job_id || !applicant_name || !email || !phone || !cover_letter) {
      return res.status(400).json({
        message: "Please complete all application fields."
      });
    }

    const job = db.prepare(
      "SELECT * FROM jobs WHERE id = ?"
    ).get(job_id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found."
      });
    }

    const result = db.prepare(`
      INSERT INTO applications
      (job_id, applicant_name, email, phone, cover_letter)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      job_id,
      applicant_name,
      email,
      phone,
      cover_letter
    );

    res.status(201).json({
      message: "Application submitted successfully!",
      applicationId: result.lastInsertRowid
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to submit application."
    });
  }
});
// Get all job applications for admin dashboard
app.get("/api/applications", (req, res) => {
  try {
    const applications = db.prepare(`
      SELECT
        applications.id,
        applications.applicant_name,
        applications.email,
        applications.phone,
        applications.cover_letter,
        applications.status,
        applications.applied_at,
        jobs.title AS job_title,
        jobs.company AS company
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      ORDER BY applications.id DESC
    `).all();

    res.json(applications);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to load applications."
    });
  }
});
// Update application status
app.put("/api/applications/:id/status", (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Reviewed",
      "Accepted",
      "Rejected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status."
      });
    }

    const result = db.prepare(`
      UPDATE applications
      SET status = ?
      WHERE id = ?
    `).run(status, applicationId);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Application not found."
      });
    }

    res.json({
      message: "Application status updated successfully!"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update application status."
    });
  }
});
// Delete a job
app.delete("/api/jobs/:id", (req, res) => {
  try {
    const jobId = req.params.id;

    // Remove applications linked to this job first
    db.prepare(
      "DELETE FROM applications WHERE job_id = ?"
    ).run(jobId);

    const result = db.prepare(
      "DELETE FROM jobs WHERE id = ?"
    ).run(jobId);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Job not found."
      });
    }

    res.json({
      message: "Job deleted successfully!"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to delete job."
    });
  }
});

// Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please complete all registration fields."
      });
    }

    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(name, email, hashedPassword, "jobseeker");

    res.status(201).json({
      message: "Account created successfully!",
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create account."
    });
  }
});
// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password."
      });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to login."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Job Portal running at http://localhost:${PORT}`);
});