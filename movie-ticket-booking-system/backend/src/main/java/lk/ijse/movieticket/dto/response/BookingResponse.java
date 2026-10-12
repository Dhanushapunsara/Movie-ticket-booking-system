package lk.ijse.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record BookingResponse(
        Long id,
        Long userId,
        String customerName,
        String customerEmail,
        Long showId,
        Long movieId,
        String movieTitle,
        String moviePosterUrl,
        String theatreName,
        String theatreLocation,
        LocalDate showDate,
        @JsonFormat(pattern = "HH:mm") LocalTime showTime,
        BigDecimal ticketPrice,
        List<String> seatNumbers,
        Integer numberOfTickets,
        BigDecimal totalAmount,
        LocalDateTime bookingDate,
        BookingStatus status,
        Long paymentId,
        PaymentStatus paymentStatus,
        boolean cancellable,
        boolean payable
) {
}
