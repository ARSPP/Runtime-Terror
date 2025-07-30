navigator.geolocation.getCurrentPosition(
  (position) => {
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;
  },
  (error) => {
    message.textContent = "Please enable location services to search for restaurants.";
  }
);

let restaurantQueryInput = document.getElementById("restuarantQuery");
let queryBtn = document.getElementById("queryBtn");
let message =  document.getElementById("message");

queryBtn.addEventListener('click', queryRestaurants);

function queryRestaurants(){
    if(!userLat || !userLong ){
        message.textContent = "Please enable location services to search for restaurants.";
        return;
    }
    fetch(`/restuarants?lat=${userLat}&long=${userLong}`)
}