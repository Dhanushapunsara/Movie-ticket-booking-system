package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Example:
 * { "showId": 5, "seatNumbers": ["A1", "A2", "A3"], "numberOfTickets": 3 }
 */
public record BookingRequest(
        @NotNull(message = "Show ID is required")
        Long showId,

        @NotEmpty(message = "At least one seat must be selected")
        @Size(max = 10, message = "You can book at most 10 seats at a time")
        List<@NotBlank(message = "Seat number cannot be blank") String> seatNumbers,

        @NotNull(message = "Number of tickets is required")
        @Min(value = 1, message = "Number of tickets must be at least 1")
        @Max(value = 10, message = "Number of tickets must be at most 10")
        Integer numberOfTickets
) {
}
