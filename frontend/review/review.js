let restaurantData = null;
let currentUsername = null;
let restaurantName = document.getElementById("restaurantName");
let restaurantAddress = document.getElementById("restaurantAddress");
let reviewForm = document.getElementById("reviewFormElement");
let message = document.getElementById("message");
let wantToGoCheckbox = document.getElementById("wantToGoCheckbox");

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
        const response = await fetch(`/reviews/restaurant/${restaurantData.fsq_place_id || restaurantData.id}`);
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
                <div class="review-body">
                <p class="review-text">${review.review_text}</p>
                </div>
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
        restaurant_id: restaurantData.fsq_place_id || restaurantData.id, 
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

async function loadWantToGoStatus() {
    if (!restaurantData || !currentUsername) return;
    
    try {
        const response = await fetch(`/want-to-go-status/${restaurantData.fsq_place_id}?username=${currentUsername}`);
        if (response.ok) {
            const data = await response.json();
            wantToGoCheckbox.checked = data.wantToGo;
        }
    } catch (error) {
        console.error("Error loading want-to-go status:", error);
    }
}

async function toggleWantToGo() {
    if (!currentUsername || !restaurantData) {
        message.textContent = "Please log in to use this feature.";
        wantToGoCheckbox.checked = false;
        return;
    }
    
    const isChecked = wantToGoCheckbox.checked;
    const method = isChecked ? "POST" : "DELETE";
    
    try {
        const response = await fetch("/want-to-go", {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: currentUsername,
                restaurant_id: restaurantData.fsq_place_id,
                restaurant_name: restaurantData.name,
                restaurant_location: restaurantData.location
            }),
        });
        
        if (!response.ok) {
            throw new Error("Failed to update want-to-go status");
        }
        
        const messageText = isChecked ? "Added to your want-to-go list!" : "Removed from your want-to-go list.";
        message.textContent = messageText;
        setTimeout(() => {
            message.textContent = "";
        }, 3000);
    } catch (error) {
        console.error("Error updating want-to-go status:", error);
        message.textContent = "Error updating want-to-go status. Please try again.";
        wantToGoCheckbox.checked = !isChecked;
    }
}

reviewForm.addEventListener("submit", submitReview);
wantToGoCheckbox.addEventListener("change", toggleWantToGo);

async function initializePage() {
    loadRestaurantData();
    await getCurrentUser();
    await loadWantToGoStatus();
}

initializePage();