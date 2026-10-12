package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.TheatreRequest;
import lk.ijse.movieticket.dto.response.TheatreResponse;
import lk.ijse.movieticket.enums.TheatreStatus;

import java.util.List;

public interface TheatreService {

    TheatreResponse createTheatre(TheatreRequest request);

    List<TheatreResponse> getTheatres(TheatreStatus status);

    TheatreResponse getTheatreById(Long id);

    TheatreResponse updateTheatre(Long id, TheatreRequest request);

    void deleteTheatre(Long id);
}
