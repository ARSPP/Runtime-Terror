let restaurantData = null;
let restaurantName = document.getElementById("restaurantName");
let restaurantAddress = document.getElementById("restaurantAddress");
let reviewForm = document.getElementById("reviewFormElement");
let message = document.getElementById("message");

function loadRestaurantData() {
    const storedData = localStorage.getItem("restaurantData");
    if (storedData) {
        restaurantData = JSON.parse(storedData);
        displayRestaurantInfo();
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

function submitReview(event) {
    event.preventDefault();
    
    const rating = document.getElementById("rating").value;
    const reviewText = document.getElementById("reviewText").value;
    
    if (!rating || !reviewText) {
        message.textContent = "Please fill in all fields.";
        return;
    }
    
    const reviewData = {
        restaurant_id: restaurantData.id,
        restaurant_name: restaurantData.name,
        rating: parseInt(rating),
        review_text: reviewText,
        timestamp: new Date().toISOString()
    };
    
    fetch("/submit-review", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
    })
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        console.log(response);
        message.textContent = "Review submitted successfully!";
        reviewForm.reset();
    })
    .catch((error) => {
        console.log(error);
        message.textContent = "Error submitting review. Please try again.";
    });
}

reviewForm.addEventListener("submit", submitReview);

loadRestaurantData(); 