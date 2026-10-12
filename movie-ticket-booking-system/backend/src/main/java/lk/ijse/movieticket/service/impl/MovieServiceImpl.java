package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.MovieRequest;
import lk.ijse.movieticket.dto.response.MovieResponse;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.entity.Movie;
import lk.ijse.movieticket.enums.MovieStatus;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.exception.ResourceNotFoundException;
import lk.ijse.movieticket.repository.MovieRepository;
import lk.ijse.movieticket.repository.ShowRepository;
import lk.ijse.movieticket.service.MovieService;
import lk.ijse.movieticket.util.EntityMapper;
import lk.ijse.movieticket.util.Paging;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private static final Set<String> SORTABLE = Set.of("id", "title", "releaseDate", "durationMinutes", "language", "genre");

    private final MovieRepository movieRepository;
    private final ShowRepository showRepository;

    @Override
    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = new Movie();
        apply(movie, request);
        movie = movieRepository.save(movie);
        log.info("Movie created: id={}, title='{}'", movie.getId(), movie.getTitle());
        return EntityMapper.toMovieResponse(movie);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> getMovies(String title, String language, String genre, MovieStatus status,
                                                 int page, int size, String sort) {
        return PageResponse.of(
                movieRepository.search(blankToNull(title), blankToNull(language), blankToNull(genre), status,
                        Paging.of(page, size, parseSort(sort))),
                EntityMapper::toMovieResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        return EntityMapper.toMovieResponse(findMovie(id));
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = findMovie(id);
        apply(movie, request);
        log.info("Movie updated: id={}, status={}", id, movie.getStatus());
        return EntityMapper.toMovieResponse(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = findMovie(id);
        if (showRepository.existsByMovieId(id)) {
            throw new ConflictException("Movie has shows and cannot be deleted. Set its status to ENDED instead.");
        }
        movieRepository.delete(movie);
        log.info("Movie deleted: id={}", id);
    }

    private Movie findMovie(Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Movie", id));
    }

    private void apply(Movie movie, MovieRequest r) {
        movie.setTitle(r.title().trim());
        movie.setDescription(blankToNull(r.description()));
        movie.setDurationMinutes(r.durationMinutes());
        movie.setLanguage(r.language().trim());
        movie.setGenre(r.genre().trim());
        movie.setReleaseDate(r.releaseDate());
        movie.setPosterUrl(blankToNull(r.posterUrl()));
        movie.setStatus(r.status());
    }

    /** "title,asc" / "releaseDate,desc" -> Sort; unknown fields fall back to id */
    private Sort parseSort(String sort) {
        if (!StringUtils.hasText(sort)) {
            return Sort.by(Sort.Direction.DESC, "id");
        }
        String[] parts = sort.split(",");
        String field = SORTABLE.contains(parts[0]) ? parts[0] : "id";
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(dir, field);
    }

    private static String blankToNull(String s) {
        return StringUtils.hasText(s) ? s.trim() : null;
    }
}
