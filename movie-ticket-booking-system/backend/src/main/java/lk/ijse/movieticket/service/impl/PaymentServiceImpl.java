package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.PaymentProcessRequest;
import lk.ijse.movieticket.dto.request.PaymentRequest;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.PaymentResponse;
import lk.ijse.movieticket.dto.response.PaymentStatusResponse;
import lk.ijse.movieticket.entity.Booking;
import lk.ijse.movieticket.entity.Payment;
import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.PaymentStatus;
import lk.ijse.movieticket.exception.BusinessRuleException;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.exception.ResourceNotFoundException;
import lk.ijse.movieticket.repository.BookingRepository;
import lk.ijse.movieticket.repository.PaymentRepository;
import lk.ijse.movieticket.security.CurrentUserProvider;
import lk.ijse.movieticket.service.PaymentService;
import lk.ijse.movieticket.util.EntityMapper;
import lk.ijse.movieticket.util.Paging;
import lk.ijse.movieticket.util.ShowTimes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Payment flow:
 * 1. POST /api/payments            -> creates a PENDING payment for a PENDING booking
 * 2. PUT  /api/payments/{id}/process -> simulated gateway: COMPLETED (booking CONFIRMED) or FAILED (booking stays PENDING)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findWithDetailsById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", request.bookingId()));
        assertOwnerOrAdmin(booking);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleException("Cancelled bookings cannot be paid for");
        }
        if (!ShowTimes.isBookable(booking.getShow())) {
            throw new BusinessRuleException("This show is no longer open for payment");
        }

        // Booking 1:1 Payment - reuse the existing payment record for retries.
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (payment != null) {
            switch (payment.getStatus()) {
                case COMPLETED -> throw new ConflictException("This booking has already been paid");
                case REFUNDED -> throw new BusinessRuleException("This booking's payment was refunded");
                default -> { /* PENDING or FAILED: allow a new attempt */ }
            }
            payment.setPaymentMethod(request.paymentMethod());
            payment.setAmount(booking.getTotalAmount());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setPaymentDate(null);
            payment.setTransactionReference(null);
            log.info("Payment re-initiated: paymentId={}, bookingId={}", payment.getId(), booking.getId());
        } else {
            payment = Payment.builder()
                    .booking(booking)
                    .amount(booking.getTotalAmount())
                    .paymentMethod(request.paymentMethod())
                    .status(PaymentStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            booking.setPayment(payment);
        }
        payment = paymentRepository.save(payment);
        log.info("Payment created: paymentId={}, bookingId={}, amount={}, method={}",
                payment.getId(), booking.getId(), payment.getAmount(), payment.getPaymentMethod());
        return EntityMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(Long paymentId, PaymentProcessRequest request) {
        Payment payment = findWithDetails(paymentId);
        Booking booking = payment.getBooking();
        assertOwnerOrAdmin(booking);

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new ConflictException("A completed payment cannot be processed again");
        }
        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessRuleException("A refunded payment cannot be processed");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleException("Cancelled bookings cannot be paid for");
        }
        if (!ShowTimes.isBookable(booking.getShow())) {
            throw new BusinessRuleException("This show is no longer open for payment");
        }

        boolean fail = request != null && request.shouldFail();
        payment.setPaymentDate(LocalDateTime.now());

        if (fail) {
            // A failed payment must NOT confirm the booking.
            payment.setStatus(PaymentStatus.FAILED);
            payment.setTransactionReference(null);
            log.warn("Payment FAILED: paymentId={}, bookingId={}", paymentId, booking.getId());
        } else {
            // A completed payment confirms the booking.
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
            log.info("Payment COMPLETED: paymentId={}, bookingId={}, ref={} -> booking CONFIRMED",
                    paymentId, booking.getId(), payment.getTransactionReference());
        }
        return EntityMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = findWithDetails(id);
        assertOwnerOrAdmin(payment.getBooking());
        return EntityMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(Long id) {
        Payment payment = findWithDetails(id);
        assertOwnerOrAdmin(payment.getBooking());
        return new PaymentStatusResponse(payment.getId(), payment.getBooking().getId(),
                payment.getStatus(), payment.getBooking().getStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for booking id: " + bookingId));
        assertOwnerOrAdmin(payment.getBooking());
        return EntityMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getAllPayments(PaymentStatus status, int page, int size) {
        return PageResponse.of(
                paymentRepository.search(status, Paging.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))),
                EntityMapper::toPaymentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getMyPayments(int page, int size) {
        User user = currentUserProvider.getCurrentUser();
        return PageResponse.of(
                paymentRepository.findByBookingUserId(user.getId(), Paging.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))),
                EntityMapper::toPaymentResponse);
    }

    private Payment findWithDetails(Long id) {
        return paymentRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Payment", id));
    }

    private void assertOwnerOrAdmin(Booking booking) {
        User current = currentUserProvider.getCurrentUser();
        if (!currentUserProvider.isAdmin(current) && !Objects.equals(booking.getUser().getId(), current.getId())) {
            throw new AccessDeniedException("You can only access payments for your own bookings");
        }
    }
}
