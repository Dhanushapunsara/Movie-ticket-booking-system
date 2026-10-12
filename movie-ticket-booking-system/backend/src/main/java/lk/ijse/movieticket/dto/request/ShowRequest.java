package lk.ijse.movieticket.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lk.ijse.movieticket.enums.ShowStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ShowRequest(
        @NotNull(message = "Movie ID is required")
        Long movieId,

        @NotNull(message = "Theatre ID is required")
        Long theatreId,

        @NotNull(message = "Show date is required (yyyy-MM-dd)")
        LocalDate showDate,

        @NotNull(message = "Show time is required (HH:mm)")
        @JsonFormat(pattern = "HH:mm[:ss]")
        LocalTime showTime,

        @NotNull(message = "Ticket price is required")
        @DecimalMin(value = "0.01", message = "Ticket price must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Ticket price can have at most 2 decimal places")
        BigDecimal ticketPrice,

        /** Optional - defaults to SCHEDULED on create. */
        ShowStatus status
) {
}
