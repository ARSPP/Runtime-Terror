let express = require("express");
let env = require("../env.json");
let { Pool } = require("pg");

let app = express();
let pool = new Pool(env);
app.use(express.json());

function validateReview(body) {
    return (
        body.hasOwnProperty("restaurant_id") &&
        body.hasOwnProperty("restaurant_name") &&
        body.hasOwnProperty("rating") &&
        body.hasOwnProperty("review_text") &&
        body.hasOwnProperty("timestamp") &&
        body.hasOwnProperty("username")
    );
}

app.post("/submit-review", async (req, res) => { 
    let { body } = req;

    if (!validateReview(body)) {
        return res.sendStatus(400);
    }

    let { restaurant_id, restaurant_name, rating, review_text, timestamp, username } = body;

    let query = `INSERT INTO reviews (restaurant_id, restaurant_name, rating, review_text, timestamp, username)
            VALUES ($1, $2, $3, $4, $5, $6);`;
    let values = [
        restaurant_id,
        restaurant_name,
        rating,
        review_text,
        timestamp,
        username
    ];

    try {
        await pool.query(query, values);
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error inserting review:", error);
        return res.sendStatus(500);
    }
});

app.get("/reviews/:restaurantId", async (req, res) => {
    let { restaurantId } = req.params;

    let query = `SELECT username, rating, review_text, timestamp 
                 FROM reviews 
                 WHERE restaurant_id = $1 
                 ORDER BY timestamp DESC;`;

    try {
        let result = await pool.query(query, [restaurantId]);
        return res.json(result.rows);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.sendStatus(500);
    }
});

module.exports = app;