checkLoginStatus();


export async function checkLoginStatus() {
  try {
    const response = await fetch("/private", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
    } else {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    window.location.href = "/login";
  }
}

export async function logout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
    showMessage("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    showMessage("Logout error occurred");
  }
}
