checkLoginStatus();
getFeed();

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

let feedDiv = document.getElementById("feed");

function getFeed() {
  getFollowing().then((followingString) => {
    populateFeed(followingString);
  });
}

function getFollowing() {
  return fetch("/following", { credentials: "include" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error:" + response.status);
      }
      return response.json();
    })
    .then((data) => {
      return data.join(",");
    })
    .catch((error) => {
      console.log(error);
    });
}

async function populateFeed(following) {
  console.log(following);

  try {
    const response = await fetch(`/reviews/following?following=${following}`);
    if (!response.ok) {
      throw new Error("HTTP error:" + response.status);
    }
    const data = await response.json();

    const reviewHTMLArray = await Promise.all(
      data.map((review) => createReviewDiv(review))
    );
    let htmlIn = reviewHTMLArray.join("");
    if (htmlIn.trim() != "") {
      feedDiv.innerHTML = htmlIn;
    }
  } catch (error) {
    console.error(error);
  }
}

async function createReviewDiv(review) {
  let date = new Date(review.timestamp).toLocaleDateString();
  let stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  let restDiv = await createRestaurantDiv(review.restaurant_id);

  return `
            <div class="review-item">
                <div class="review-header">
                    <span class = "review-username">${review.username}</span>
                    <span class = "review-stars">${stars}</span>
                </div>
                <div class = "review-body">
                <p class="feed-review-text">${review.review_text}</p>
                ${restDiv}
                </div>
                <div class = "review-footer">
                  <span>${date}</span>
                </div>
            </div>
        `;
}

async function createRestaurantDiv(restaurant_id) {
  try {
    let response = await fetch(`/restaurants/${restaurant_id}`);
    if (!response.ok) {
      throw new Error("HTTP error: " + response.status);
    }
    const data = await response.json();

    return `
      <div class="restaurant-review-info">
        <h1>${data.name}</h1>
        <h2>${data.location.formatted_address}</h2>
        <h3>${data.website || ""}</h3>
      </div>`;
  } catch (error) {
    console.error(error);
    return `<div class="restaurant-info error">Restaurant info unavailable</div>`;
  }
}


