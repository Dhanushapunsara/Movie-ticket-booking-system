package lk.ijse.movieticket.exception;

/** The request conflicts with the current state (duplicate email, seat already booked, show clash ...) -> 409 Conflict */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
