package lk.ijse.movieticket.dto.response;

import lk.ijse.movieticket.enums.MovieStatus;

import java.time.LocalDate;

public record MovieResponse(
        Long id,
        String title,
        String description,
        Integer durationMinutes,
        String language,
        String genre,
        LocalDate releaseDate,
        String posterUrl,
        MovieStatus status
) {
}
