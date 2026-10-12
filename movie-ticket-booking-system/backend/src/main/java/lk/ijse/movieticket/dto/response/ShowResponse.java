package lk.ijse.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lk.ijse.movieticket.enums.ShowStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ShowResponse(
        Long id,
        Long movieId,
        String movieTitle,
        String moviePosterUrl,
        Integer movieDurationMinutes,
        String movieLanguage,
        String movieGenre,
        Long theatreId,
        String theatreName,
        String theatreLocation,
        Integer capacity,
        LocalDate showDate,
        @JsonFormat(pattern = "HH:mm") LocalTime showTime,
        @JsonFormat(pattern = "HH:mm") LocalTime endTime,
        BigDecimal ticketPrice,
        ShowStatus status,
        long bookedSeats,
        long availableSeats,
        boolean bookable
) {
}
