let userLat = null;
let userLong = null;
let queryBtn = document.getElementById("queryBtn");
let message = document.getElementById("message");
let resultsContainer = document.getElementById("results");
let backToAccountBtn = document.getElementById("backToAccountBtn");

queryBtn.addEventListener("click", queryRestaurants);
backToAccountBtn.addEventListener("click", () => {
    window.location.href = "/";
});

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
  resultsContainer.innerHTML = ""; 
  zipResults.innerHTML = "";
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

        resultsContainer.appendChild(div);
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

const zipInput = document.getElementById("zipInput");
const zipBtn = document.getElementById("zipBtn");
const zipResults = document.getElementById("zipResults");

zipBtn?.addEventListener("click", async () => {
  resultsContainer.innerHTML = "";
  message.textContent = "";

  const raw = (zipInput?.value || "").trim();
  const digits = raw.replace(/\D/g, "").slice(0, 5);

  if (digits.length !== 5) {
    zipResults.innerHTML = `<p>Please enter a valid 5-digit zipcode.</p>`;
    return;
  }

  zipResults.innerHTML = `<p>Searching…</p>`;
  try {
    const resp = await fetch(`/api/restaurants/by-zip/${digits}`);
    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      throw new Error(e.error || `Request failed (${resp.status})`);
    }
    const data = await resp.json();
    renderRestaurants(data.restaurants);
  } catch (err) {
    console.error(err);
    zipResults.innerHTML = `<p>Sorry, something went wrong. Please try again.</p>`;
  }
});

function renderRestaurants(list) {
  resultsContainer.innerHTML = ""; 
  zipResults.innerHTML = "";
  if (!list || list.length === 0) {
    resultsContainer.innerHTML = `<p class="muted label-gold">No restaurants found for that zipcode.</p>`;
    return;
  }
  resultsContainer.innerHTML = `<p class="zip-results-count zip-results-red">Found ${list.length} restaurant(s).</p>`;
  list.forEach((rest) => {
    const div = document.createElement("div");
    div.classList.add("restaurantSearchResult");
    div.style.cursor = "pointer";
    div.innerHTML = `
      <h1>${rest.name}</h1>
      <h2>${rest.location.formatted_address || rest.location.address || rest.location.postcode || ""}</h2>
    `;
    div.addEventListener("click", () => {
      localStorage.setItem("restaurantData", JSON.stringify(rest));
      window.location.href = "/review";
    });
    resultsContainer.appendChild(div);
  });
}
