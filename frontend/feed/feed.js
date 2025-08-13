let feedDiv = document.getElementById("feed");

getFeed();

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

function populateFeed(following) {
  console.log(following);
fetch(`/reviews/following?following=${following}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error:" + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let reviews = "";
      data.forEach(review => {
        let revDiv = createReviewDiv(review);
        reviews += revDiv;
      });
      feedDiv.innerHTML = reviews;
    })
    .catch((error) => {
      console.error(error);
    });
}

function createReviewDiv(review){
  console.log(review);
        let date = new Date(review.timestamp).toLocaleDateString();
        let stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <strong>${review.username}</strong>
                    <span class="rating">${stars}</span>
                    <span class="date">${date}</span>
                </div>
                <p class="review-text">${review.review_text}</p>
            </div>
        `;
}
