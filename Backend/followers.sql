CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE follows (
    follower VARCHAR(255) REFERENCES users(username),
    following VARCHAR(255) REFERENCES users(username),
    PRIMARY KEY (follower, following)
);