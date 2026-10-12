package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lk.ijse.movieticket.enums.BookingStatus;

public record BookingStatusUpdateRequest(
        @NotNull(message = "Status is required (PENDING, CONFIRMED, CANCELLED)")
        BookingStatus status
) {
}
