// === CONFIGURATION ===
// Use your API address (update port as needed)
const API_BASE_URL = "http://localhost:5006"; 
// For Android emulator -> "https://10.0.2.2:7182"

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const messageBox = document.getElementById("message");

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const payload = {
        username: username,
        passwordHash: password // same as API property
      };

      try {
        const response = await fetch(`${API_BASE_URL}/User/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const text = await response.text();

        if (response.ok) {
          showMessage("✅ Login successful!", "success");
          // Redirect to dashboard (create dashboard.html later)
          setTimeout(() => window.location.href = "dashboard.html", 1000);
        } else {
          showMessage("❌ " + text, "error");
        }
      } catch (err) {
        showMessage("⚠️ " + err.message, "error");
      }
    });
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("regUsername").value;
      const password = document.getElementById("regPassword").value;

      const payload = {
        username: username,
        passwordHash: password
      };

      try {
        const response = await fetch(`${API_BASE_URL}/User/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const text = await response.text();

        if (response.ok) {
          showMessage("✅ Registration successful! Redirecting...", "success");
          setTimeout(() => window.location.href = "index.html", 1000);
        } else {
          showMessage("❌ " + text, "error");
        }
      } catch (err) {
        showMessage("⚠️ " + err.message, "error");
      }
    });
  }

  // Show message helper
  function showMessage(msg, type) {
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.className = type;
  }
});
