let express = require("express");
let pool = require("./db");

let app = express();
app.use(express.json());

app.post("/want-to-go", async (req, res) => {
  let { restaurant_id, username, restaurant_name, restaurant_location } = req.body;

  if (!restaurant_id || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // First, ensure the restaurant exists in the database
    if (restaurant_name && restaurant_location) {
      let restaurantQuery = `INSERT INTO restaurants (id, name, location)
                             VALUES ($1, $2, $3)
                             ON CONFLICT (id) DO NOTHING`;
      await pool.query(restaurantQuery, [restaurant_id, restaurant_name, restaurant_location]);
    }

    // Then add to want-to-go list
    let query = `INSERT INTO want_to_go (username, restaurant_id)
                 VALUES ($1, $2)
                 ON CONFLICT (username, restaurant_id) DO NOTHING`;
    
    await pool.query(query, [username, restaurant_id]);
    return res.status(200).json({ message: "Added to want-to-go list" });
  } catch (error) {
    console.error("Error adding to want-to-go:", error);
    return res.status(500).json({ error: "Failed to add to want-to-go list" });
  }
});

app.delete("/want-to-go", async (req, res) => {
  let { restaurant_id, username } = req.body;

  if (!restaurant_id || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let query = `DELETE FROM want_to_go 
               WHERE username = $1 AND restaurant_id = $2`;
  
  try {
    let result = await pool.query(query, [username, restaurant_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }
    return res.status(200).json({ message: "Removed from want-to-go list" });
  } catch (error) {
    console.error("Error removing from want-to-go:", error);
    return res.status(500).json({ error: "Failed to remove from want-to-go list" });
  }
});

app.get("/want-to-go/:username", async (req, res) => {
  let { username } = req.params;

  let query = `SELECT w.restaurant_id, w.added_at, r.name, r.location
               FROM want_to_go w
               JOIN restaurants r ON w.restaurant_id = r.id
               WHERE w.username = $1
               ORDER BY w.added_at DESC`;
  
  try {
    let result = await pool.query(query, [username]);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching want-to-go list:", error);
    return res.status(500).json({ error: "Failed to fetch want-to-go list" });
  }
});

app.get("/want-to-go-status/:restaurantId", async (req, res) => {
  let { restaurantId } = req.params;
  let { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Missing username parameter" });
  }

  let query = `SELECT 1 FROM want_to_go 
               WHERE username = $1 AND restaurant_id = $2`;
  
  try {
    let result = await pool.query(query, [username, restaurantId]);
    return res.json({ wantToGo: result.rowCount > 0 });
  } catch (error) {
    console.error("Error checking want-to-go status:", error);
    return res.status(500).json({ error: "Failed to check want-to-go status" });
  }
});

app.get("/want-to-go/feed", async (req, res) => {
  if (!req.query.following) {
    return res.status(400).json({ error: "Missing 'following' parameter" });
  }
  
  let usernames = req.query.following.split(",");
  
  let query = `SELECT w.username, w.restaurant_id, w.added_at, 
                      r.name as restaurant_name, r.location, r.website
               FROM want_to_go w
               JOIN restaurants r ON w.restaurant_id = r.id
               WHERE w.username = ANY($1::text[])
               ORDER BY w.added_at DESC`;
  
  try {
    let result = await pool.query(query, [usernames]);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching friends' want-to-go:", error);
    return res.status(500).json({ error: "Failed to fetch want-to-go feed" });
  }
});

module.exports = app;