let userLat = null;
let userLong = null

navigator.geolocation.getCurrentPosition(
  (position) => {
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;
  },
  (error) => {
    message.textContent = "Please enable location services to search for restaurants.";
  }
);

let restaurantQueryInput = document.getElementById("restaurantQuery");
if(!restaurantQueryInput){
  console.log("NULLLLL");
}
let queryBtn = document.getElementById("queryBtn");
let message =  document.getElementById("message");

queryBtn.addEventListener('click', queryRestaurants);

function queryRestaurants(){
    if(!userLat || !userLong ){
        message.textContent = "Please enable location services to search for restaurants.";
        return;
    }
    message.textContent = '';
    let query = restaurantQueryInput.value;
    console.log(query);
    fetch(`/restaurants?lat=${userLat}&long=${userLong}`)
    .then((response)=>{return response.json();})
    .then((data)=>{
      console.log(data);
    }).catch((err) =>{
      console.log(err);
    })
}