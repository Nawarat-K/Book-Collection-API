BEGIN;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS books;

CREATE TABLE
    users (
        user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    books (
        book_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_username VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        genre VARCHAR(100),
        status VARCHAR(20) DEFAULT 'WANT TO READ',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_username) REFERENCES users (username) ON DELETE CASCADE
    );

COMMIT;