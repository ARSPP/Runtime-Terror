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

module.exports = app;