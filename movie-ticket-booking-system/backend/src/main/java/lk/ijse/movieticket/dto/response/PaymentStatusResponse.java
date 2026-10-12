package lk.ijse.movieticket.dto.response;

import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.PaymentStatus;

public record PaymentStatusResponse(
        Long paymentId,
        Long bookingId,
        PaymentStatus paymentStatus,
        BookingStatus bookingStatus
) {
}
