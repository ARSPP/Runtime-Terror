let express = require("express");
let { Pool } = require("pg");
let argon2 = require("argon2");
let cookieParser = require("cookie-parser");
let crypto = require("crypto");
let env = require("../env.json");

let pool = new Pool(env);
let app = express();
app.use(express.json());
app.use(cookieParser());

// global object for storing tokens
// this needs to be a DB call in the future. So log-in's are persistent
let tokenStorage = {};

pool.connect().then(() => {
  console.log("Connected to database");
});

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

let cookieOptions = {
  httpOnly: true,
  secure: false, //THIS NEEDS TO BE TRUE IN ACTUAL APP BUT FOR LOCAL IT NEEDS TO BE FALSE
  sameSite: "strict",
};

function validateLogin(body) {
    if (body.username && body.password) {
        return true;
    }
    return false;
}

app.post("/create", async (req, res) => {
  let { body } = req;

  if (!validateLogin(body)) {
    return res.sendStatus(400);
  }

  let { username, password } = body;

  let hash;
  try {
    hash = await argon2.hash(password);
  } catch (error) {
    console.log("HASH FAILED", error);
    return res.sendStatus(500);
  }

  console.log(hash);
  try {
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hash,
    ]);
  } catch (error) {
    console.log("INSERT FAILED", error);
    return res.sendStatus(500);
  }

  // Automatically log in after account creation
  let token = makeToken();
  tokenStorage[token] = username;
  return res.cookie("token", token, cookieOptions).send();
});

app.post("/login", async (req, res) => {
  let { body } = req;
  
  if (!validateLogin(body)) {
    return res.sendStatus(400);
  }
  let { username, password } = body;

  let result;
  try {
    result = await pool.query(
      "SELECT password FROM users WHERE username = $1",
      [username],
    );
  } catch (error) {
    console.log("SELECT FAILED", error);
    return res.sendStatus(500);
  }

  if (result.rows.length === 0) {
    return res.sendStatus(400);
  }
  let hash = result.rows[0].password;

  let verifyResult;
  try {
    verifyResult = await argon2.verify(hash, password);
  } catch (error) {
    console.log("VERIFY FAILED", error);
    return res.sendStatus(500);
  }

  console.log(verifyResult);
  if (!verifyResult) {
    console.log("Credentials didn't match");
    return res.sendStatus(400);
  }

  let token = makeToken();
  console.log("Generated token", token);
  tokenStorage[token] = username;
  return res.cookie("token", token, cookieOptions).send();
});

let authorize = (req, res, next) => {
  let { token } = req.cookies;
  if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
    return res.sendStatus(403);
  }
  next();
};

app.post("/logout", (req, res) => {
  let { token } = req.cookies;

  if (token === undefined) {
    console.log("Already logged out");
    return res.sendStatus(400);
  }

  if (!tokenStorage.hasOwnProperty(token)) {
    console.log("Token doesn't exist");
    return res.sendStatus(400);
  }

  delete tokenStorage[token];

  return res.clearCookie("token", cookieOptions).send();
});

app.get("/private", authorize, (req, res) => {
  return res.send("A private message\n");
});

app.get("/current-user", authorize, (req, res) => {
  const username = tokenStorage[req.cookies.token];
  return res.json({ username });
});

// Follow a user
app.post("/follow", authorize, async (req, res) => {
    const { following } = req.body;
    const follower = tokenStorage[req.cookies.token];

    if (!following || follower === following) {
        return res.sendStatus(400);
    }

    try {
        await pool.query(
            "INSERT INTO follows (follower, following) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [follower, following]
        );
        res.sendStatus(200);
    } catch (error) {
        console.log("FOLLOW FAILED", error);
        res.sendStatus(500);
    }
});

// Unfollow a user
app.post("/unfollow", authorize, async (req, res) => {
    const { following } = req.body;
    const follower = tokenStorage[req.cookies.token];

    if (!following || follower === following) {
        return res.sendStatus(400);
    }

    try {
        await pool.query(
            "DELETE FROM follows WHERE follower = $1 AND following = $2",
            [follower, following]
        );
        res.sendStatus(200);
    } catch (error) {
        console.log("UNFOLLOW FAILED", error);
        res.sendStatus(500);
    }
});

// Get who the current user is following
app.get("/following", authorize, async (req, res) => {
    const follower = tokenStorage[req.cookies.token];
    try {
        const result = await pool.query(
            "SELECT following FROM follows WHERE follower = $1",
            [follower]
        );
        res.json(result.rows.map(row => row.following));
    } catch (error) {
        console.log("GET FOLLOWING FAILED", error);
        res.sendStatus(500);
    }
});

// Get followers of the current user
app.get("/followers", authorize, async (req, res) => {
    const following = tokenStorage[req.cookies.token];
    try {
        const result = await pool.query(
            "SELECT follower FROM follows WHERE following = $1",
            [following]
        );
        res.json(result.rows.map(row => row.follower));
    } catch (error) {
        console.log("GET FOLLOWERS FAILED", error);
        res.sendStatus(500);
    }
});




module.exports = app;