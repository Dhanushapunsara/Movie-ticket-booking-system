package lk.ijse.movieticket.controller;

import jakarta.validation.Valid;
import lk.ijse.movieticket.dto.request.ShowRequest;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.SeatAvailabilityResponse;
import lk.ijse.movieticket.dto.response.ShowResponse;
import lk.ijse.movieticket.enums.ShowStatus;
import lk.ijse.movieticket.service.ShowService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowResponse> createShow(@Valid @RequestBody ShowRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(showService.createShow(request));
    }

    /**
     * Filter by movie / theatre / date / status, with pagination.
     * GET /api/shows?movieId=1&theatreId=2&date=2026-10-20&status=SCHEDULED&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<PageResponse<ShowResponse>> getShows(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long theatreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ShowStatus status,
            @RequestParam(defaultValue = "false") boolean upcomingOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(showService.getShows(movieId, theatreId, date, status, upcomingOnly, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowResponse> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    /** Seat map for a show: all seats, already-booked seats and availability. */
    @GetMapping("/{id}/seats")
    public ResponseEntity<SeatAvailabilityResponse> getSeatAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getSeatAvailability(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowResponse> updateShow(@PathVariable Long id, @Valid @RequestBody ShowRequest request) {
        return ResponseEntity.ok(showService.updateShow(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.noContent().build();
    }
}
