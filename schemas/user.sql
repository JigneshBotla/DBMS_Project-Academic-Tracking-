CREATE TABLE user (
	username VARCHAR(25) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash CHAR(60) NOT NULL
);