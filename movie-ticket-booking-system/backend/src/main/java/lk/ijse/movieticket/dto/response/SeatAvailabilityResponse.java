package lk.ijse.movieticket.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SeatAvailabilityResponse(
        Long showId,
        int capacity,
        int seatsPerRow,
        List<SeatRow> rows,
        List<String> bookedSeats,
        int availableSeats,
        BigDecimal ticketPrice,
        boolean bookable
) {
    public record SeatRow(String row, List<String> seats) {
    }
}
