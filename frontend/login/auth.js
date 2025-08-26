
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("createBtn").addEventListener("click", createAccount);
});

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showMessage("Please enter both username and password");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      showMessage("Login successful!");
      window.location.href = "/";
    } else {
      showMessage("Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Login error occurred");
  }
}

async function createAccount() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showMessage("Please enter both username and password");
    return;
  }

  try {
    const response = await fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      showMessage("Account created and logged in!");
      window.location.href = "/";
    } else {
      showMessage("Account creation failed. Username might already exist.");
    }
  } catch (error) {
    console.error("Create account error:", error);
    showMessage("Account creation error occurred");
  }
}

function showMessage(message) {
  document.getElementById("message").textContent = message;
}
