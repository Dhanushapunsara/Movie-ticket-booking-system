# Future Expansion — Student Proposal

The core system uses exactly the six required entities (User, Movie, Theatre, Show, Booking, Payment).
These are proposed next steps, with their impact on the data model.

---

## Backend proposals

### 1. Multiple screens and a real seat inventory

**Feature.** A theatre (cinema) has several screens. Each screen has its own seat layout with seat types (Standard, Premium, Couple, Accessible) and per-type pricing.

**Why it's useful.** Real cinemas run several halls at once and charge more for premium seats. Today one "theatre" equals one hall and seat numbers are generated from capacity, so there's no way to block broken seats or price rows differently.

**Entities affected.** `Theatre` (becomes the cinema building), `Show` (now belongs to a screen), `Booking` (references seats instead of storing seat strings).

**New entities.** `Screen`, `Seat`, `ShowSeat` (seat state per show), optionally `SeatType`.

**Relationship changes.**
```
Theatre 1:M Screen
Screen  1:M Seat
Screen  1:M Show          (replaces Theatre 1:M Show)
Show    1:M ShowSeat  M:1 Seat
Booking 1:M ShowSeat      (replaces the booking_seats collection table)
```
A unique constraint on `(show_id, seat_id)` in `show_seats` makes double-booking impossible at database level, and `ShowSeat.status` (AVAILABLE / HELD / BOOKED) enables timed seat holds.

### 2. Movie reviews and ratings

**Feature.** Customers who attended a show can rate the movie (1–5) and write a review; movies show an average rating.

**Why it's useful.** Helps customers choose, and gives admins feedback on which movies to keep showing.

**Entities affected.** `Movie` (adds a cached `averageRating` / `reviewCount`), `User`.

**New entity.** `Review (id, rating, comment, createdAt, user_id, movie_id)`.

**Relationship changes.**
```
User  1:M Review
Movie 1:M Review
UNIQUE (user_id, movie_id)   -- one review per customer per movie
```
Business rule: a user may review only if they have a `CONFIRMED` booking for a completed show of that movie.

### 3. Discount and promotional codes

**Feature.** Admins create promo codes (percentage or fixed amount, validity dates, usage limits); customers apply a code at checkout.

**Entities affected.** `Booking` gains `discountAmount` and `finalAmount`; `Payment.amount` uses `finalAmount`.

**New entities.** `PromoCode`, and `PromoRedemption` to enforce per-user limits.

**Relationship changes.** `PromoCode 1:M Booking` (nullable FK on bookings), `User 1:M PromoRedemption M:1 PromoCode`.

---

## Frontend proposals

1. **Reviews and ratings UI** — star ratings on movie cards, a review list and a "Rate this movie" form in booking history after the show date. Improves discovery and trust.
2. **Promo code interface** — a "Have a promo code?" field in the booking summary that validates the code live and shows the discount before payment. Makes checkout feel rewarding and transparent.
3. **Email/SMS notification preferences** — a profile section to opt in to booking confirmations and show reminders, with an in-app notification bell. Reduces missed shows.
4. **Online payment gateway integration** — replace the simulated "process payment" step with a hosted checkout (e.g. PayHere, Stripe), redirecting back to the booking page with the result.
5. **Booking and revenue dashboard charts** — revenue per day/movie and seat-occupancy charts on the admin dashboard.

---

## Repository submission process

1. Create a GitHub repository, e.g. `movie-ticket-booking-system` (public, or private with the lecturer added as a collaborator).
2. From the project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Movie Ticket Booking System (Spring Boot + React)"
   git branch -M main
   git remote add origin https://github.com/<your-username>/movie-ticket-booking-system.git
   git push -u origin main
   ```
3. Check that the repository contains `README.md`, `.gitignore`, `backend/pom.xml`, `database/schema.sql`, `frontend/package.json` — and does **not** contain `backend/target/`, `frontend/node_modules/` or real passwords.
4. Keep committing in small, meaningful steps (e.g. "Add booking seat validation", "Add payment page") so the history shows the work.
5. Submit the repository URL (`https://github.com/<your-username>/movie-ticket-booking-system`) for both Assignment 1 and Assignment 2 (or two repositories — one for `backend/`, one for `frontend/` — if your batch requires separate submissions).
