package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.ShowRequest;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.SeatAvailabilityResponse;
import lk.ijse.movieticket.dto.response.ShowResponse;
import lk.ijse.movieticket.enums.ShowStatus;

import java.time.LocalDate;

public interface ShowService {

    ShowResponse createShow(ShowRequest request);

    /**
     * @param upcomingOnly when true, only shows from today onwards are returned
     */
    PageResponse<ShowResponse> getShows(Long movieId, Long theatreId, LocalDate date, ShowStatus status,
                                        boolean upcomingOnly, int page, int size);

    ShowResponse getShowById(Long id);

    ShowResponse updateShow(Long id, ShowRequest request);

    void deleteShow(Long id);

    SeatAvailabilityResponse getSeatAvailability(Long showId);
}
