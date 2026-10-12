package lk.ijse.movieticket.dto.response;

import lk.ijse.movieticket.enums.TheatreStatus;

public record TheatreResponse(
        Long id,
        String name,
        String location,
        Integer capacity,
        TheatreStatus status
) {
}
