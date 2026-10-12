Online Movie Ticket Booking System - Backend

Project Description

This is the backend REST API for an Online Movie Ticket Booking platform developed as part of the CMJD 114/115 coursework. The system enables customers to browse movies, view available shows, select seats, book tickets, and process payments. It also features an administrative panel to manage users, movies, theatres, shows, bookings, and payments. The API is secured using Spring Security and JWT authentication.

Technologies Used

Java 17+

Spring Boot (Web, Data JPA, Security)

Spring Security & JWT (Authentication & Authorization)

MySQL (Relational Database)

Maven (Dependency Management)

Lombok (Boilerplate reduction)

Database Configuration

To run this project locally, ensure you have MySQL installed and running. Create a database named movie_booking_db. Update your src/main/resources/application.properties file with your local database credentials:

spring.datasource.url=jdbc:mysql://localhost:3306/movie_booking_db?createDatabaseIfNotExist=true
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true


Entity Relationship Diagram (ERD)

(Note: Replace the image path below with the actual path to your exported ERD image)


Core Relationships:

User 1:M Booking

Booking M:1 Show

Booking 1:1 Payment

Show M:1 Movie

Show M:1 Theatre

API Endpoints

Authentication

POST /api/auth/signup - Register a new customer

POST /api/auth/signin - Authenticate and get JWT token

Users (Admin Only)

GET /api/users - Get all users

GET /api/users/{id} - Get user by ID

PUT /api/users/{id} - Update user

DELETE /api/users/{id} - Delete user

Movies

POST /api/movies - Create movie (Admin)

GET /api/movies - Get all movies (Public/Customer)

GET /api/movies/{id} - Get movie by ID

PUT /api/movies/{id} - Update movie (Admin)

DELETE /api/movies/{id} - Delete movie (Admin)

Theatres

POST /api/theatres - Create theatre (Admin)

GET /api/theatres - Get all theatres

GET /api/theatres/{id} - Get theatre by ID

PUT /api/theatres/{id} - Update theatre (Admin)

DELETE /api/theatres/{id} - Delete theatre (Admin)

Shows

POST /api/shows - Create show (Admin)

GET /api/shows - Get all shows

GET /api/shows/{id} - Get show by ID

PUT /api/shows/{id} - Update show (Admin)

DELETE /api/shows/{id} - Delete show (Admin)

Bookings

POST /api/bookings - Create booking (Customer)

GET /api/bookings/{id} - Get booking by ID

GET /api/bookings/my-bookings - Get customer's bookings (Customer)

PUT /api/bookings/{id}/cancel - Cancel booking

Payments

POST /api/payments - Create payment

GET /api/payments/{id} - Get payment details

Authentication Instructions

The API is secured using JSON Web Tokens (JWT).

Register a new user via POST /api/auth/signup.

Login via POST /api/auth/signin to receive a token.

For all secured endpoints, include the token in the HTTP Authorization header as a Bearer token:
Authorization: Bearer <your_jwt_token_here>

Sample API Requests

1. Sign Up (POST /api/auth/signup)

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "CUSTOMER"
}


2. Create Booking (POST /api/bookings)

{
  "showId": 5,
  "seatNumbers": ["A1", "A2", "A3"],
  "numberOfTickets": 3
}


How to Run the Project

Clone the repository: git clone <repository_url>

Navigate to the project directory: cd backend

Configure the application.properties with your MySQL credentials.

Build the project using Maven: mvn clean install

Run the application: mvn spring-boot:run

The server will start on http://localhost:8080.

Future Expansion Proposal

1. Feature: Interactive Seat Layout & Dynamic Pricing

Description: Allow users to see a visual map of the theatre and select seats visually. Premium seats (e.g., VIP boxes or recliners) will have higher prices than standard seats.

Why it is useful: Improves UI/UX significantly and allows the cinema to maximize revenue through tiered seat pricing.

Affected Entities: Theatre, Show, Booking.

New Entities Required: Seat (to store specific row/column/tier data for a theatre).

Database Relationships:

Theatre 1:M Seat

Show 1:M ShowSeat (Mapping table to track which specific seats are booked for which show, rather than just storing string arrays in the Booking entity).

2. Feature: Movie Reviews and Ratings

Description: Allow authenticated customers to leave a star rating out of 5 and a text review for movies they have watched (i.e., movies associated with a COMPLETED booking).

Why it is useful: Builds a community around the platform, helps other users decide what to watch, and increases user engagement.

Affected Entities: User, Movie.

New Entities Required: Review (Attributes: Review ID, User, Movie, Rating, Comment, Timestamp).

Database Relationships:

User 1:M Review

Movie 1:M Review
