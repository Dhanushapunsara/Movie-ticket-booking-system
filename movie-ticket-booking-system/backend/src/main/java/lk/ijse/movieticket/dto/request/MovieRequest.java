package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.*;
import lk.ijse.movieticket.enums.MovieStatus;

import java.time.LocalDate;

public record MovieRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be at most 150 characters")
        String title,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 600, message = "Duration must be at most 600 minutes")
        Integer durationMinutes,

        @NotBlank(message = "Language is required")
        @Size(max = 50, message = "Language must be at most 50 characters")
        String language,

        @NotBlank(message = "Genre is required")
        @Size(max = 50, message = "Genre must be at most 50 characters")
        String genre,

        LocalDate releaseDate,

        @Size(max = 500, message = "Poster URL must be at most 500 characters")
        String posterUrl,

        @NotNull(message = "Status is required (UPCOMING, NOW_SHOWING, ENDED)")
        MovieStatus status
) {
}
