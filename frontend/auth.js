const API_BASE = "http://localhost:5000/api/auth";

// ===== Tab switching =====
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// ===== Login form =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const usernameError = document.getElementById("loginUsernameError");
  const passwordError = document.getElementById("loginPasswordError");
  const message = document.getElementById("loginMessage");

  usernameError.textContent = "";
  passwordError.textContent = "";
  message.textContent = "";
  message.className = "form-message";

  let hasError = false;

  if (!username) {
    usernameError.textContent = "Username is required";
    hasError = true;
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    hasError = true;
  }

  if (hasError) return;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Login failed";
      message.className = "form-message error";
      return;
    }

    // Save token + username for later use
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    message.textContent = "Login successful! Redirecting...";
    message.className = "form-message success";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch (error) {
    message.textContent = "Could not connect to server";
    message.className = "form-message error";
  }
});

// ===== Register form =====
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  const usernameError = document.getElementById("registerUsernameError");
  const passwordError = document.getElementById("registerPasswordError");
  const message = document.getElementById("registerMessage");

  usernameError.textContent = "";
  passwordError.textContent = "";
  message.textContent = "";
  message.className = "form-message";

  let hasError = false;

  if (!username) {
    usernameError.textContent = "Username is required";
    hasError = true;
  } else if (username.length < 3) {
    usernameError.textContent = "Username must be at least 3 characters";
    hasError = true;
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    hasError = true;
  } else if (password.length < 4) {
    passwordError.textContent = "Password must be at least 4 characters";
    hasError = true;
  }

  if (hasError) return;

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Registration failed";
      message.className = "form-message error";
      return;
    }

    message.textContent = "Registered successfully! You can login now.";
    message.className = "form-message success";
    registerForm.reset();

    setTimeout(() => {
      loginTab.click();
    }, 1000);
  } catch (error) {
    message.textContent = "Could not connect to server";
    message.className = "form-message error";
  }
});