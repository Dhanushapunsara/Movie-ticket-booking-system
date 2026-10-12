package lk.ijse.movieticket.controller;

import jakarta.validation.Valid;
import lk.ijse.movieticket.dto.request.TheatreRequest;
import lk.ijse.movieticket.dto.response.TheatreResponse;
import lk.ijse.movieticket.enums.TheatreStatus;
import lk.ijse.movieticket.service.TheatreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
@RequiredArgsConstructor
public class TheatreController {

    private final TheatreService theatreService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheatreResponse> createTheatre(@Valid @RequestBody TheatreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(theatreService.createTheatre(request));
    }

    @GetMapping
    public ResponseEntity<List<TheatreResponse>> getTheatres(@RequestParam(required = false) TheatreStatus status) {
        return ResponseEntity.ok(theatreService.getTheatres(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheatreResponse> getTheatreById(@PathVariable Long id) {
        return ResponseEntity.ok(theatreService.getTheatreById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheatreResponse> updateTheatre(@PathVariable Long id, @Valid @RequestBody TheatreRequest request) {
        return ResponseEntity.ok(theatreService.updateTheatre(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTheatre(@PathVariable Long id) {
        theatreService.deleteTheatre(id);
        return ResponseEntity.noContent().build();
    }
}
