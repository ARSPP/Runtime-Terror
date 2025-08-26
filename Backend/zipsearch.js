const express = require("express");
const router = express.Router();
const pool = require("./db");

router.get("/by-zip/:zip", async (req, res) => {
  try {
    const raw = req.params.zip || "";
    const digits = raw.replace(/\D/g, "").slice(0, 5);

    if (digits.length !== 5) {
      return res.status(400).json({ error: "Please provide a valid 5-digit zipcode." });
    }

    const { rows } = await pool.query(
      `
        SELECT id, name, location
        FROM restaurants
        WHERE location->>'postcode' = $1
        ORDER BY name ASC
      `,
      [digits]
    );

    return res.json({ zipcode: digits, count: rows.length, restaurants: rows });
  } catch (err) {
    console.error("by-zip error", err);
    res.status(500).json({ error: "Server error searching by zipcode." });
  }
});


module.exports = router;