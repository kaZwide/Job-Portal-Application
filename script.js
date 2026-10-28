const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const searchButton = document.getElementById("searchButton");
const jobListings = document.getElementById("jobListings");

let allJobs = [];

// Get jobs from the database
async function loadJobs() {
  try {
    const response = await fetch("/api/jobs");
    allJobs = await response.json();

    displayJobs(allJobs);
  } catch (error) {
    console.error("Error loading jobs:", error);
    jobListings.innerHTML = "<p>Unable to load jobs.</p>";
  }
}

// Display jobs on the page
function displayJobs(jobs) {
  jobListings.innerHTML = "";

  if (jobs.length === 0) {
    jobListings.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  jobs.forEach(function (job) {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");

    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p>${job.description}</p>
      <button class="apply-button" data-id="${job.id}">
        Apply Now
      </button>
    `;

    jobListings.appendChild(jobCard);

const applyButton = jobCard.querySelector(".apply-button");

applyButton.addEventListener("click", function () {
  document.getElementById("applicationJobId").value = job.id;

  document.getElementById("selectedJob").textContent =
    `Applying for: ${job.title} at ${job.company}`;

  document.getElementById("applicationSection").style.display = "block";

  document.getElementById("applicationMessage").textContent = "";

  document.getElementById("applicationSection").scrollIntoView({
    behavior: "smooth"
  });
});
  });
}

// Search and filter jobs
function filterJobs() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedLocation = locationFilter.value.toLowerCase();

  const filteredJobs = allJobs.filter(function (job) {
    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.company.toLowerCase().includes(searchText) ||
      job.description.toLowerCase().includes(searchText);

    const matchesLocation =
      selectedLocation === "" ||
      job.location.toLowerCase() === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  displayJobs(filteredJobs);
}

searchButton.addEventListener("click", filterJobs);
searchInput.addEventListener("input", filterJobs);
locationFilter.addEventListener("change", filterJobs);

loadJobs();

const jobForm = document.getElementById("jobForm");
const jobMessage = document.getElementById("jobMessage");

jobForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newJob = {
    title: document.getElementById("jobTitle").value.trim(),
    company: document.getElementById("company").value.trim(),
    location: document.getElementById("jobLocation").value,
    description: document.getElementById("jobDescription").value.trim()
  };

  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newJob)
    });

    const data = await response.json();

    if (!response.ok) {
      jobMessage.textContent = data.message;
      return;
    }

    jobMessage.textContent = "Job posted successfully!";

    jobForm.reset();

    await loadJobs();

  } catch (error) {
    console.error("Error posting job:", error);
    jobMessage.textContent = "Unable to post job.";
  }
});
const applicationForm = document.getElementById("applicationForm");
const applicationMessage = document.getElementById("applicationMessage");
const cancelApplication = document.getElementById("cancelApplication");

applicationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const application = {
    job_id: document.getElementById("applicationJobId").value,
    applicant_name: document.getElementById("applicantName").value.trim(),
    email: document.getElementById("applicantEmail").value.trim(),
    phone: document.getElementById("applicantPhone").value.trim(),
    cover_letter: document.getElementById("coverLetter").value.trim()
  };

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(application)
    });

    const data = await response.json();

    if (!response.ok) {
      applicationMessage.textContent = data.message;
      return;
    }

    applicationMessage.textContent = "Application submitted successfully!";

    applicationForm.reset();

  } catch (error) {
    console.error("Error submitting application:", error);
    applicationMessage.textContent = "Unable to submit application.";
  }
});

cancelApplication.addEventListener("click", function () {
  applicationForm.reset();
  applicationMessage.textContent = "";
  document.getElementById("applicationSection").style.display = "none";
});

// Register a new user
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const message = document.getElementById("registerMessage");

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            registerForm.reset();
        }
    } catch (error) {
        console.error(error);
        message.textContent = "Unable to create account.";
    }
});   

// Login form
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      loginMessage.textContent = data.message;

      if (response.ok) {
        loginForm.reset();

        if (data.user.role === "admin") {
          window.location.href = "/admin.html";
        }
      }
    } catch (error) {
      console.error(error);
      loginMessage.textContent = "Unable to login.";
    }
  });
}