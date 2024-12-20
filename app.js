const apiBase = "http://localhost:3000";

let userRole = "";

// Handle Login
document.getElementById("login-button").addEventListener("click", () => {
  const email = document.getElementById("email").value;

  fetch(`${apiBase}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((response) => response.json())
    .then((data) => {
      userRole = data.role;
      document.getElementById("login-container").style.display = "none";
      document.getElementById("app").style.display = "block";
      document.getElementById("role-info").innerText = `Welcome! You are logged in as: ${userRole}`;
      loadAppContent();
    })
    .catch((error) => {
      document.getElementById("login-error").innerText = "Login failed. Please check your email.";
      console.error(error);
    });
});

function loadAppContent() {
  if (userRole === "BDM") {
    loadFeedbackSection();
  } else if (userRole === "Product Manager") {
    loadManagementSection();
  }
}

// Placeholder functions for loading different sections
function loadFeedbackSection() {
  document.getElementById("content").innerHTML = "<h2>Feedback Section for BDM</h2>";
}

function loadManagementSection() {
  document.getElementById("content").innerHTML = "<h2>Management Section for Product Manager</h2>";
}
