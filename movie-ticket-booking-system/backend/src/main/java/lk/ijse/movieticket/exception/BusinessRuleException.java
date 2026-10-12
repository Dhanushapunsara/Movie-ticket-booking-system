package lk.ijse.movieticket.exception;

/** A business rule was broken (e.g. booking a cancelled show) -> 400 Bad Request */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
