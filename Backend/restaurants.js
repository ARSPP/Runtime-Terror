let express = require('express');
let axios = require('axios');
let env = require('../env.json');
let app = express();

app.use(express.json());

app.get('/restaurants', (req, res) => {
    
    let latitude = req.query.lat;
    let longitude = req.query.long;
    if(!validLocation(latitude, longitude)){
        return res.status(400).json({error:"Improper lat/long location"});
    }

    let restaurantCategoryId = '4d4b7105d754a06374d81259';
    let apiKey = env.foursquareApiKey;

    console.log(`Lat: ${latitude}, Long: ${longitude}`);
    axios.get(`https://places-api.foursquare.com/places/search?ll=${latitude}%2C${longitude}&fsq_category_ids=${restaurantCategoryId}&sort=DISTANCE`, {
        headers :{
            'X-Places-Api-Version': '2025-06-17',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => {
        console.log(response.data);
    })
    .catch(err => {
        return res.status(err.response.status).json({error: err.response.statusText});
    });
    
})

function validLocation(lat, long) {
    lat = Number(lat);
    long = Number(long);
    if (isNaN(lat) || isNaN(long)) {
        return false;
    }

    if (lat < -90 || lat > 90) {
        return false;
    }

    if (long < -180 || long > 180) {
        return false;
    }

    return true;
}

module.exports = app;
