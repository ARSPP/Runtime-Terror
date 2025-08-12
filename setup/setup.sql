DROP TABLE IF EXISTS follows;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE restaurants (
    id TEXT PRIMARY KEY,
    name TEXT,
    tel TEXT,
    email TEXT,
    website TEXT,
    socials JSONB,
    location JSONB
);

CREATE TABLE follows (
    follower VARCHAR(255) REFERENCES users(username),
    following VARCHAR(255) REFERENCES users(username),
    PRIMARY KEY (follower, following)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username),
    restaurant_id TEXT REFERENCES restaurants(id),
    restaurant_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);