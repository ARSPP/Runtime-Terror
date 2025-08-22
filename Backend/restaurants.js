let express = require('express');
let axios = require('axios');
let app = express();
let pool = require('./db');

app.use(express.json());

app.get('/restaurants', (req, res) => {
    
    let latitude = req.query.lat;
    let longitude = req.query.long;
    let search = req.query.search
    if(!validLocation(latitude, longitude)){
        return res.status(400).json({error:"Improper lat/long location"});
    }

    let restaurantCategoryId = '4d4b7105d754a06374d81259';
    let apiKey = process.env.FOURSQUARE_API_KEY;
    let fields = "name%2Cfsq_place_id%2Clocation%2Ctel%2Cemail%2Cwebsite%2Csocial_media";
    let url = `https://places-api.foursquare.com/places/search?ll=${latitude}%2C${longitude}&fsq_category_ids=${restaurantCategoryId}&fields=${fields}&query=${search}`;

    axios.get(url, {
        headers :{
            'X-Places-Api-Version': '2025-06-17',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(response => {
        return res.status(200).json(response.data.results);
    })
    .catch(err => {
        return res.status(err.response.status).json({error: err.response.statusText});
    });
    
});

app.get('/restaurants/:id', async (req, res) =>{
    let id = req.params.id;
    if(!id){
        return res.status(400).json({error : "Missing ID parameter."});
    }
    let query = `
    SELECT name, location, website FROM restaurants WHERE id = $1`
    let values = [id];

    let {rows} = await pool.query(query, values);
    res.status(200).json(rows[0]);
});

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

app.post('/save-restaurant', async (req, res) => {
    let restInfo = req.body;

    query = `INSERT INTO restaurants (id, name, email, tel, website, location, socials)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
            RETURNING *;`;
    let values = [
        restInfo.fsq_place_id,
        restInfo.name,
        restInfo.email,
        restInfo.tel,
        restInfo.website,
        restInfo.location,
        restInfo.social_media
    ]
    try{
        let result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(200).json({ message: "Restaurant already exists." });
        } else {
            return res.status(201).json({ message: "Restaurant saved.", restaurant: result.rows[0] });
        }
    }catch(error){
        console.error("Error saving restaurant:", error);
        return res.status(500).json({ error: "Failed to save restaurant." });
    }
        

})

app.get('/api/restaurants/top-rated', async (req, res) => {
    const minReviews = parseInt(req.query.minReviews) || 5;
    const limit = parseInt(req.query.limit) || 20;

    const query = `
        SELECT 
            restaurant_id, 
            restaurant_name, 
            AVG(rating) AS avg_rating, 
            COUNT(*) AS reviews_count
        FROM reviews
        GROUP BY restaurant_id, restaurant_name
        HAVING COUNT(*) >= $1
        ORDER BY avg_rating DESC, reviews_count DESC
        LIMIT $2
    `;

    try {
        const { rows } = await pool.query(query, [minReviews, limit]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching top rated restaurants:", error);
        res.status(500).json({ error: "Failed to fetch top rated restaurants." });
    }
});


module.exports = app;
