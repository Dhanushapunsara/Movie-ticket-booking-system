package lk.ijse.movieticket.dto.response;

import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.PaymentMethod;
import lk.ijse.movieticket.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PaymentResponse(
        Long id,
        Long bookingId,
        BookingStatus bookingStatus,
        Long userId,
        String customerName,
        String movieTitle,
        List<String> seatNumbers,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        PaymentStatus status,
        LocalDateTime paymentDate,
        String transactionReference,
        LocalDateTime createdAt
) {
}
