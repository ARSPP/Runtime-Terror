import {checkLoginStatus, logout} from "../main.js"

document.getElementById("logoutBtn").addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
    loadUsername();
    loadFollowing();
});

document.getElementById("followBtn").addEventListener("click", async () => {
  const username = document.getElementById("searchUser").value;
  if (!username) {
    document.getElementById("followMessage").textContent = "Enter a username.";
    return;
  }
  const res = await fetch("/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ following: username }),
  });
  if (res.ok) {
    document.getElementById(
      "followMessage"
    ).textContent = `Followed ${username}!`;
    loadFollowing();
  } else {
    document.getElementById("followMessage").textContent = "Failed to follow.";
  }
});

document.getElementById("unfollowBtn").addEventListener("click", async () => {
  const username = document.getElementById("searchUser").value;
  if (!username) {
    document.getElementById("followMessage").textContent = "Enter a username.";
    return;
  }
  const res = await fetch("/unfollow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ following: username }),
  });
  if (res.ok) {
    document.getElementById(
      "followMessage"
    ).textContent = `Unfollowed ${username}!`;
    loadFollowing();
  } else {
    document.getElementById("followMessage").textContent =
      "Failed to unfollow.";
  }
});

async function loadFollowing() {
  const res = await fetch("/following", { credentials: "include" });
  if (res.ok) {
    const list = await res.json();
    const ul = document.getElementById("followingList");
    ul.innerHTML = "";
    list.forEach((user) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `../followers-reviews/index.html?username=${encodeURIComponent(
        user
      )}`;
      a.textContent = user;
      a.className = "following-user-link";
      li.appendChild(a);
      ul.appendChild(li);
    });
  }
}

async function loadUsername() {
  console.log("Loading username...");
  try {
    const response = await fetch("/current-user", {
      method: "GET",
      credentials: "include",
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", data);
      const username = data.username;
      document.getElementById(
        "welcomeHeading"
      ).textContent = `Welcome ${username}!`;
      document.querySelector(".welcome-message").style.display = "none";
      console.log("Username loaded:", username);
    } else {
      console.error("Failed to load username, status:", response.status);
      document.getElementById("welcomeHeading").textContent = "Welcome!";
      document.querySelector(".welcome-message").style.display = "none";
    }
  } catch (error) {
    console.error("Error loading username:", error);
    document.getElementById("welcomeHeading").textContent = "Welcome!";
    document.querySelector(".welcome-message").style.display = "none";
  }
}

