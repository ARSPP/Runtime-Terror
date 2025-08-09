DROP DATABASE IF EXISTS demo2;
CREATE DATABASE demo2;
\c demo2
DROP TABLE IF EXISTS users;
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100)
);
DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants(
    id TEXT PRIMARY KEY,
    name TEXT,
    tel TEXT,
    email TEXT,
    website TEXT,
    socials JSONB,
    location JSONB
);
DROP TABLE IF EXISTS follows;
CREATE TABLE follows (
    follower VARCHAR(255) REFERENCES users(username),
    following VARCHAR(255) REFERENCES users(username),
    PRIMARY KEY (follower, following)
);