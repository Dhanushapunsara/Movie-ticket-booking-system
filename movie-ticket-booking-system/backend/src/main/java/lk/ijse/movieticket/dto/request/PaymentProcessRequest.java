package lk.ijse.movieticket.dto.request;

/**
 * Body for PUT /api/payments/{id}/process.
 * There is no real payment gateway in the core scope, so the gateway is simulated:
 * send {"simulateFailure": true} to test the FAILED path. The body is optional.
 */
public record PaymentProcessRequest(Boolean simulateFailure) {

    public boolean shouldFail() {
        return Boolean.TRUE.equals(simulateFailure);
    }
}
