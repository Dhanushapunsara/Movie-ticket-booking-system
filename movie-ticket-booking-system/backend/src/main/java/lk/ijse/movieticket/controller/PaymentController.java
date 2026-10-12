package lk.ijse.movieticket.controller;

import jakarta.validation.Valid;
import lk.ijse.movieticket.dto.request.PaymentProcessRequest;
import lk.ijse.movieticket.dto.request.PaymentRequest;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.PaymentResponse;
import lk.ijse.movieticket.dto.response.PaymentStatusResponse;
import lk.ijse.movieticket.enums.PaymentStatus;
import lk.ijse.movieticket.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Create (initiate) a payment for a booking. */
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(request));
    }

    /** Process a payment (simulated gateway). Body is optional: {"simulateFailure": true} */
    @PutMapping("/{id}/process")
    public ResponseEntity<PaymentResponse> processPayment(@PathVariable Long id,
                                                          @RequestBody(required = false) PaymentProcessRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(id, request));
    }

    /** Admin: all payments. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<PaymentResponse>> getAllPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paymentService.getAllPayments(status, page, size));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<PageResponse<PaymentResponse>> getMyPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(paymentService.getMyPayments(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(id));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getPaymentByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
}
