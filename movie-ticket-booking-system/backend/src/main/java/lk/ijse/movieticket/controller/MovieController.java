package lk.ijse.movieticket.controller;

import jakarta.validation.Valid;
import lk.ijse.movieticket.dto.request.MovieRequest;
import lk.ijse.movieticket.dto.response.MovieResponse;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.ShowResponse;
import lk.ijse.movieticket.enums.MovieStatus;
import lk.ijse.movieticket.service.MovieService;
import lk.ijse.movieticket.service.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;
    private final ShowService showService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.createMovie(request));
    }

    /**
     * Paginated + searchable list. Examples:
     * GET /api/movies?page=0&size=10
     * GET /api/movies?title=Avengers
     * GET /api/movies?language=English&status=NOW_SHOWING&sort=title,asc
     */
    @GetMapping
    public ResponseEntity<PageResponse<MovieResponse>> getMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(movieService.getMovies(title, language, genre, status, page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    /** Get shows for a movie (upcoming only by default). */
    @GetMapping("/{id}/shows")
    public ResponseEntity<PageResponse<ShowResponse>> getShowsForMovie(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean upcomingOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        movieService.getMovieById(id); // 404 if the movie doesn't exist
        return ResponseEntity.ok(showService.getShows(id, null, null, null, upcomingOnly, page, size));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieResponse> updateMovie(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.updateMovie(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}
