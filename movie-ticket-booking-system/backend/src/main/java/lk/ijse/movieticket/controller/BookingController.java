package lk.ijse.movieticket.controller;

import jakarta.validation.Valid;
import lk.ijse.movieticket.dto.request.BookingRequest;
import lk.ijse.movieticket.dto.request.BookingStatusUpdateRequest;
import lk.ijse.movieticket.dto.response.BookingResponse;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** Only authenticated customers can create bookings. */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    /** Admin: all bookings (optionally filtered by status). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, page, size));
    }

    /** The signed-in customer's bookings. */
    @GetMapping("/my-bookings")
    public ResponseEntity<PageResponse<BookingResponse>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getMyBookings(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    /** Admin: update booking status. */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> updateBookingStatus(@PathVariable Long id,
                                                               @Valid @RequestBody BookingStatusUpdateRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request));
    }
}
