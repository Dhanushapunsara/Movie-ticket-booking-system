package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.*;
import lk.ijse.movieticket.enums.TheatreStatus;

public record TheatreRequest(
        @NotBlank(message = "Theatre name is required")
        @Size(max = 100, message = "Theatre name must be at most 100 characters")
        String name,

        @NotBlank(message = "Location is required")
        @Size(max = 150, message = "Location must be at most 150 characters")
        String location,

        @NotNull(message = "Capacity is required")
        @Min(value = 10, message = "Capacity must be at least 10 seats")
        @Max(value = 500, message = "Capacity must be at most 500 seats")
        Integer capacity,

        @NotNull(message = "Status is required (ACTIVE, INACTIVE)")
        TheatreStatus status
) {
}
