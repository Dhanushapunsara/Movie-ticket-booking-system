package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.MovieRequest;
import lk.ijse.movieticket.dto.response.MovieResponse;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.enums.MovieStatus;

public interface MovieService {

    MovieResponse createMovie(MovieRequest request);

    PageResponse<MovieResponse> getMovies(String title, String language, String genre, MovieStatus status,
                                          int page, int size, String sort);

    MovieResponse getMovieById(Long id);

    MovieResponse updateMovie(Long id, MovieRequest request);

    void deleteMovie(Long id);
}
