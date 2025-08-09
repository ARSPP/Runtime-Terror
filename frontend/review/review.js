let restaurantData = null;
let currentUsername = null;
let restaurantName = document.getElementById("restaurantName");
let restaurantAddress = document.getElementById("restaurantAddress");
let reviewForm = document.getElementById("reviewFormElement");
let message = document.getElementById("message");

async function getCurrentUser() {
    try {
        const response = await fetch("/current-user", {
            method: "GET",
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUsername = data.username;
        } else {
            message.textContent = "Please log in to submit a review.";
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("Error fetching current user:", error);
        message.textContent = "Error fetching user information.";
    }
}

function loadRestaurantData() {
    const storedData = localStorage.getItem("restaurantData");
    if (storedData) {
        restaurantData = JSON.parse(storedData);
        displayRestaurantInfo();
        loadExistingReviews();
    } else {
        message.textContent = "No restaurant data found. Please go back and select a restaurant.";
    }
}

function displayRestaurantInfo() {
    if (restaurantData) {
        restaurantName.textContent = restaurantData.name;
        restaurantAddress.textContent = restaurantData.location.formatted_address;
    }
}

async function loadExistingReviews() {
    if (!restaurantData) return;
    
    try {
        const response = await fetch(`/reviews/${restaurantData.fsq_place_id}`);
        if (response.ok) {
            const reviews = await response.json();
            displayReviews(reviews);
        } else {
            console.error("Failed to load reviews");
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => {
        const date = new Date(review.timestamp).toLocaleDateString();
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        
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
    }).join("");
}

function submitReview(event) {
    event.preventDefault();
    
    const rating = document.getElementById("rating").value;
    const reviewText = document.getElementById("reviewText").value;
    
    if (!rating || !reviewText) {
        message.textContent = "Please fill in all fields.";
        return;
    }
    
    const reviewData = {
        restaurant_id: restaurantData.fsq_place_id,
        restaurant_name: restaurantData.name,
        rating: parseInt(rating),
        review_text: reviewText,
        timestamp: new Date().toISOString(),
        username: currentUsername
    };
    
    fetch("/submit-review", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
    })
    .then((response) => {
        if (response.ok) {
            message.textContent = "Review submitted successfully!";
            reviewForm.reset();
            loadExistingReviews();
        } else {
            message.textContent = "Error submitting review. Please try again.";
        }
    })
    .catch((error) => {
        console.log(error);
        message.textContent = "Error submitting review. Please try again.";
    });
}

reviewForm.addEventListener("submit", submitReview);

async function initializePage() {
    loadRestaurantData();
    await getCurrentUser();
}

initializePage(); 