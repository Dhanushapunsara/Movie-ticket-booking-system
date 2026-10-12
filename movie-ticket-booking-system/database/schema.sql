-- =====================================================================
--  Movie Ticket Booking System - MySQL database script
--  CMJD 114/115 | IJSE
--
--  Creates the database, the 6 core tables (+ booking_seats collection
--  table) and some sample movies / theatres / shows.
--
--  Users are NOT inserted here: the Spring Boot app creates the default
--  admin (admin@movieticket.lk / Admin@123) with a BCrypt-hashed password
--  on its first start-up. Customers register through POST /api/auth/signup.
--
--  Re-running this script DROPS the database and starts fresh.
-- =====================================================================

DROP DATABASE IF EXISTS movie_ticket_booking_db;
CREATE DATABASE movie_ticket_booking_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE movie_ticket_booking_db;

-- ---------------------------------------------------------------------
-- 1. users          (User 1:M Booking)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100)  NOT NULL,
    email       VARCHAR(100)  NOT NULL,
    password    VARCHAR(255)  NOT NULL,          -- BCrypt hash, never plain text
    phone       VARCHAR(20)   NULL,
    role        ENUM('ADMIN', 'CUSTOMER') NOT NULL,
    created_at  DATETIME(6)   NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 2. movies         (Movie 1:M Show)
-- ---------------------------------------------------------------------
CREATE TABLE movies (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    title             VARCHAR(150)  NOT NULL,
    description       VARCHAR(2000) NULL,
    duration_minutes  INT           NOT NULL,
    language          VARCHAR(50)   NOT NULL,
    genre             VARCHAR(50)   NOT NULL,
    release_date      DATE          NULL,
    poster_url        VARCHAR(500)  NULL,
    status            ENUM('UPCOMING', 'NOW_SHOWING', 'ENDED') NOT NULL,
    CONSTRAINT pk_movies PRIMARY KEY (id),
    CONSTRAINT chk_movies_duration CHECK (duration_minutes BETWEEN 1 AND 600)
) ENGINE = InnoDB;

CREATE INDEX idx_movies_title  ON movies (title);
CREATE INDEX idx_movies_status ON movies (status);

-- ---------------------------------------------------------------------
-- 3. theatres       (Theatre 1:M Show)
--    Seats are numbered A1..A10, B1..B10 ... up to `capacity`.
-- ---------------------------------------------------------------------
CREATE TABLE theatres (
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    name      VARCHAR(100) NOT NULL,
    location  VARCHAR(150) NOT NULL,
    capacity  INT          NOT NULL,
    status    ENUM('ACTIVE', 'INACTIVE') NOT NULL,
    CONSTRAINT pk_theatres PRIMARY KEY (id),
    CONSTRAINT chk_theatres_capacity CHECK (capacity BETWEEN 10 AND 500)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 4. shows          (Show M:1 Movie, Show M:1 Theatre)
--    Named "shows" because SHOW is a reserved word in MySQL.
-- ---------------------------------------------------------------------
CREATE TABLE shows (
    id            BIGINT         NOT NULL AUTO_INCREMENT,
    movie_id      BIGINT         NOT NULL,
    theatre_id    BIGINT         NOT NULL,
    show_date     DATE           NOT NULL,
    show_time     TIME           NOT NULL,
    ticket_price  DECIMAL(10, 2) NOT NULL,
    status        ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL,
    CONSTRAINT pk_shows PRIMARY KEY (id),
    CONSTRAINT fk_shows_movie   FOREIGN KEY (movie_id)   REFERENCES movies (id),
    CONSTRAINT fk_shows_theatre FOREIGN KEY (theatre_id) REFERENCES theatres (id),
    CONSTRAINT chk_shows_price CHECK (ticket_price > 0)
) ENGINE = InnoDB;

CREATE INDEX idx_shows_theatre_date ON shows (theatre_id, show_date);
CREATE INDEX idx_shows_date         ON shows (show_date);

-- ---------------------------------------------------------------------
-- 5. bookings       (Booking M:1 User, Booking M:1 Show)
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
    id                 BIGINT         NOT NULL AUTO_INCREMENT,
    user_id            BIGINT         NOT NULL,
    show_id            BIGINT         NOT NULL,
    number_of_tickets  INT            NOT NULL,
    total_amount       DECIMAL(10, 2) NOT NULL,
    booking_date       DATETIME(6)    NOT NULL,
    status             ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL,
    CONSTRAINT pk_bookings PRIMARY KEY (id),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_bookings_show FOREIGN KEY (show_id) REFERENCES shows (id),
    CONSTRAINT chk_bookings_tickets CHECK (number_of_tickets >= 1)
) ENGINE = InnoDB;

-- Seat numbers selected in a booking (part of the Booking entity, @ElementCollection)
CREATE TABLE booking_seats (
    booking_id   BIGINT      NOT NULL,
    seat_number  VARCHAR(10) NOT NULL,
    CONSTRAINT fk_booking_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_booking_seats_seat ON booking_seats (seat_number);

-- ---------------------------------------------------------------------
-- 6. payments       (Payment 1:1 Booking)
-- ---------------------------------------------------------------------
CREATE TABLE payments (
    id                     BIGINT         NOT NULL AUTO_INCREMENT,
    booking_id             BIGINT         NOT NULL,
    amount                 DECIMAL(10, 2) NOT NULL,
    payment_date           DATETIME(6)    NULL,
    payment_method         ENUM('CREDIT_CARD', 'DEBIT_CARD', 'ONLINE_BANKING', 'CASH') NOT NULL,
    status                 ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL,
    transaction_reference  VARCHAR(50)    NULL,
    created_at             DATETIME(6)    NOT NULL,
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT uk_payments_booking UNIQUE (booking_id),          -- enforces 1:1
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE = InnoDB;

-- =====================================================================
--  Sample data
-- =====================================================================

INSERT INTO movies (title, description, duration_minutes, language, genre, release_date, poster_url, status) VALUES
('The Last Monsoon',
 'A retired fisherman and his granddaughter race against a once-in-a-century storm to save their coastal village.',
 128, 'English', 'Drama', '2026-09-18', NULL, 'NOW_SHOWING'),
('Orbit Zero',
 'When a routine supply mission goes silent, a rookie engineer must bring a crippled space station home alone.',
 142, 'English', 'Sci-Fi', '2026-09-25', NULL, 'NOW_SHOWING'),
('Kandy Heist',
 'Five strangers, one festival night and the most daring jewel robbery the hill capital has ever seen.',
 115, 'Sinhala', 'Thriller', '2026-10-02', NULL, 'NOW_SHOWING'),
('Laugh Track',
 'A struggling stand-up comic accidentally becomes the voice of a viral talking-cat app.',
 98, 'English', 'Comedy', '2026-10-09', NULL, 'NOW_SHOWING'),
('Thunder Valley',
 'A young mahout and a runaway elephant cross the dry zone in this animated family adventure.',
 104, 'Tamil', 'Animation', '2026-11-20', NULL, 'UPCOMING'),
('Silent Harbour',
 'A noir mystery set in 1950s Colombo port.',
 121, 'English', 'Mystery', '2026-06-12', NULL, 'ENDED');

INSERT INTO theatres (name, location, capacity, status) VALUES
('Scope Cinemas - Hall 1', 'Colombo 03',  100, 'ACTIVE'),
('Savoy Premiere',         'Wellawatte',   80, 'ACTIVE'),
('Liberty Lite',           'Kollupitiya', 120, 'ACTIVE'),
('Regal Kandy',            'Kandy',        60, 'INACTIVE');

-- Shows are generated relative to today, so the sample data never goes stale.
INSERT INTO shows (movie_id, theatre_id, show_date, show_time, ticket_price, status) VALUES
(1, 1, CURDATE() + INTERVAL 1 DAY, '10:30:00', 1500.00, 'SCHEDULED'),
(1, 1, CURDATE() + INTERVAL 1 DAY, '14:00:00', 1500.00, 'SCHEDULED'),
(2, 1, CURDATE() + INTERVAL 1 DAY, '18:30:00', 1800.00, 'SCHEDULED'),
(2, 2, CURDATE() + INTERVAL 2 DAY, '11:00:00', 1700.00, 'SCHEDULED'),
(3, 2, CURDATE() + INTERVAL 2 DAY, '15:00:00', 1200.00, 'SCHEDULED'),
(3, 3, CURDATE() + INTERVAL 1 DAY, '19:00:00', 1300.00, 'SCHEDULED'),
(4, 3, CURDATE() + INTERVAL 3 DAY, '16:00:00', 1000.00, 'SCHEDULED'),
(4, 2, CURDATE() + INTERVAL 3 DAY, '20:30:00', 1100.00, 'SCHEDULED');

-- Quick check
SELECT 'movies' AS table_name, COUNT(*) AS row_count FROM movies
UNION ALL SELECT 'theatres', COUNT(*) FROM theatres
UNION ALL SELECT 'shows',    COUNT(*) FROM shows;
