let userLat = null;
let userLong = null;
let queryBtn = document.getElementById("queryBtn");
let message = document.getElementById("message");
let searchResults = document.getElementById("results");
queryBtn.addEventListener("click", queryRestaurants);

queryBtn.disabled = true;
message.textContent = "Trying to find your location.\n Make sure you have allowed location services for this site.";

navigator.geolocation.getCurrentPosition(
  (position) => {
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;
    queryBtn.disabled = false;
    message.textContent = "";
  },
  (error) => {
    message.textContent =
      "Please enable location services to search for restaurants.";
  }
);

let restaurantQueryInput = document.getElementById("restaurantQuery");

function queryRestaurants() {
  searchResults.innerHTML = "";
  if (!userLat || !userLong) {
    message.textContent =
      "Please enable location services to search for restaurants.";
    return;
  }
  message.textContent = "";
  let query = restaurantQueryInput.value;
  fetch(`/restaurants?lat=${userLat}&long=${userLong}&search=${query}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        message.textContent = "No restaurants found for your search.";
        return;
      }
      message.textContent = "";
      data.forEach((rest) => {
        let div = document.createElement("div");
        div.classList.add("restaurantSearchResult");
        div.style.cursor = "pointer";
        div.innerHTML = `
        <h1>${rest.name}</h1>
        <h2>${rest.location.formatted_address}</h2>`;

        div.addEventListener("click", () => {
          addRestaurantToDBAndNavigate(rest);
        });

        searchResults.appendChild(div);
      });
    })
    .catch((err) => {
      console.log(err);
      message.textContent =
        "Sorry there was a problem searching for restaurants.";
    });
}

function addRestaurantToDBAndNavigate(data) {
  fetch("/save-restaurant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      localStorage.setItem("restaurantData", JSON.stringify(data));
      window.location.href = "/review";
    })
    .catch((error) => {
      console.log(error);
    });
}
