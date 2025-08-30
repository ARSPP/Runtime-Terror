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

let currentOffset = 0;
const REVIEWS_PER_PAGE = 10;

async function populateFeed(following, append = false) {
  console.log(following);

  try {
    // Request one extra to check if there are more results
    const response = await fetch(
      `/reviews/following?following=${following}&limit=${REVIEWS_PER_PAGE + 1}&offset=${currentOffset}`
    );
    if (!response.ok) {
      throw new Error("HTTP error:" + response.status);
    }
    const data = await response.json();
    
    let hasMore = data.length > REVIEWS_PER_PAGE;
    let reviewsToShow = hasMore ? data.slice(0, REVIEWS_PER_PAGE) : data;

    const reviewHTMLArray = await Promise.all(
      reviewsToShow.map((review) => createReviewDiv(review))
    );
    let htmlIn = reviewHTMLArray.join("");

    if (htmlIn.trim() != "") {
      if (append) {
        feedDiv.innerHTML += htmlIn;
      } else {
        feedDiv.innerHTML = htmlIn;
        currentOffset = 0;
      }
      currentOffset += reviewsToShow.length;

      updateLoadMoreButton(hasMore);
    } else if (!append) {
      feedDiv.innerHTML =
        "<p>No reviews to show. Follow some users to see their reviews!</p>";
    }
  } catch (error) {
    console.error(error);
  }
}

function updateLoadMoreButton(hasMore) {
  let loadMoreBtn = document.getElementById("loadMoreBtn");

  if (hasMore) {
    if (!loadMoreBtn) {
      loadMoreBtn = document.createElement("button");
      loadMoreBtn.id = "loadMoreBtn";
      loadMoreBtn.textContent = "Load More";
      loadMoreBtn.className = "btn secondary";
      loadMoreBtn.onclick = loadMoreReviews;
      feedDiv.parentNode.appendChild(loadMoreBtn);
    }
  } else if (loadMoreBtn) {
    loadMoreBtn.remove();
  }
}

async function loadMoreReviews() {
  const following = await getFollowing();
  await populateFeed(following, true);
}

async function createReviewDiv(review) {
  let date = new Date(review.timestamp).toLocaleString();
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
