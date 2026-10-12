package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lk.ijse.movieticket.enums.PaymentMethod;

public record PaymentRequest(
        @NotNull(message = "Booking ID is required")
        Long bookingId,

        @NotNull(message = "Payment method is required (CREDIT_CARD, DEBIT_CARD, ONLINE_BANKING, CASH)")
        PaymentMethod paymentMethod
) {
}
