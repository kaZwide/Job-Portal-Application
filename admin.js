const adminJobs = document.getElementById("adminJobs");
const adminApplications = document.getElementById("adminApplications");

// Load all jobs
async function loadAdminJobs() {
  try {
    const response = await fetch("/api/jobs");
    const jobs = await response.json();

    adminJobs.innerHTML = "";

    if (jobs.length === 0) {
      adminJobs.innerHTML = "<p>No jobs available.</p>";
      return;
    }

    jobs.forEach(function (job) {
      const jobCard = document.createElement("div");
      jobCard.classList.add("admin-card");

      jobCard.innerHTML = `
  <h3>${job.title}</h3>
  <p><strong>Company:</strong> ${job.company}</p>
  <p><strong>Location:</strong> ${job.location}</p>
  <p>${job.description}</p>

  <button class="delete-job" data-id="${job.id}">
    Delete Job
  </button>
`;

      adminJobs.appendChild(jobCard);
      const deleteButton = jobCard.querySelector(".delete-job");

deleteButton.addEventListener("click", async function () {
  const jobId = this.dataset.id;

  const confirmed = confirm(
    "Are you sure you want to delete this job?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Job deleted successfully!");

    await loadAdminJobs();
    await loadApplications();

  } catch (error) {
    console.error("Error deleting job:", error);
    alert("Unable to delete job.");
  }
});
    });

  } catch (error) {
    console.error("Error loading jobs:", error);
    adminJobs.innerHTML = "<p>Unable to load jobs.</p>";
  }
}

// Load all applications
async function loadApplications() {
  try {
    const response = await fetch("/api/applications");
    const applications = await response.json();

    adminApplications.innerHTML = "";

    if (applications.length === 0) {
      adminApplications.innerHTML = "<p>No applications submitted.</p>";
      return;
    }

    applications.forEach(function (application) {
      const applicationCard = document.createElement("div");
      applicationCard.classList.add("admin-card");

      applicationCard.innerHTML = `
        <h3>${application.applicant_name}</h3>

        <p>
          <strong>Applied for:</strong>
          ${application.job_title}
        </p>

        <p>
          <strong>Company:</strong>
          ${application.company}
        </p>

        <p>
          <strong>Email:</strong>
          ${application.email}
        </p>

        <p>
          <strong>Phone:</strong>
          ${application.phone}
        </p>

        <p>
          <strong>Cover Letter:</strong>
          ${application.cover_letter}
        </p>

        <p>
  <strong>Status:</strong>

  <select class="status-select" data-id="${application.id}">
    <option value="Pending"
      ${application.status === "Pending" ? "selected" : ""}>
      Pending
    </option>

    <option value="Reviewed"
      ${application.status === "Reviewed" ? "selected" : ""}>
      Reviewed
    </option>

    <option value="Accepted"
      ${application.status === "Accepted" ? "selected" : ""}>
      Accepted
    </option>

    <option value="Rejected"
      ${application.status === "Rejected" ? "selected" : ""}>
      Rejected
    </option>
  </select>
</p>
      `;

      adminApplications.appendChild(applicationCard);
      const statusSelect =
  applicationCard.querySelector(".status-select");

statusSelect.addEventListener("change", async function () {
  const applicationId = this.dataset.id;
  const newStatus = this.value;

  try {
    const response = await fetch(
      `/api/applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Application status updated successfully!");

  } catch (error) {
    console.error("Error updating status:", error);
    alert("Unable to update application status.");
  }
});
    });

  } catch (error) {
    console.error("Error loading applications:", error);
    adminApplications.innerHTML =
      "<p>Unable to load applications.</p>";
  }
}

loadAdminJobs();
loadApplications();