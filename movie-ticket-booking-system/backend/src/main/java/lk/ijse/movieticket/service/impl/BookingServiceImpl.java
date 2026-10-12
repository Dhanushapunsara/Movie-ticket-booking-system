package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.BookingRequest;
import lk.ijse.movieticket.dto.request.BookingStatusUpdateRequest;
import lk.ijse.movieticket.dto.response.BookingResponse;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.entity.Booking;
import lk.ijse.movieticket.entity.Payment;
import lk.ijse.movieticket.entity.Show;
import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.PaymentStatus;
import lk.ijse.movieticket.enums.ShowStatus;
import lk.ijse.movieticket.exception.BusinessRuleException;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.exception.ResourceNotFoundException;
import lk.ijse.movieticket.repository.BookingRepository;
import lk.ijse.movieticket.repository.PaymentRepository;
import lk.ijse.movieticket.repository.ShowRepository;
import lk.ijse.movieticket.security.CurrentUserProvider;
import lk.ijse.movieticket.service.BookingService;
import lk.ijse.movieticket.util.EntityMapper;
import lk.ijse.movieticket.util.Paging;
import lk.ijse.movieticket.util.SeatLayout;
import lk.ijse.movieticket.util.ShowTimes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User customer = currentUserProvider.getCurrentUser();

        // Lock the show row so two customers can't book the same seat at the same moment.
        Show show = showRepository.findByIdForUpdate(request.showId())
                .orElseThrow(() -> new ResourceNotFoundException("Show", request.showId()));

        // ---- Show rules ----
        if (show.getStatus() == ShowStatus.CANCELLED) {
            throw new BusinessRuleException("This show has been cancelled and cannot accept bookings");
        }
        if (show.getStatus() == ShowStatus.COMPLETED) {
            throw new BusinessRuleException("This show is completed and cannot accept new bookings");
        }
        if (ShowTimes.hasStarted(show)) {
            throw new BusinessRuleException("This show has already started and cannot accept new bookings");
        }

        // ---- Seat rules ----
        List<String> seats = request.seatNumbers().stream().map(SeatLayout::normalize).toList();
        Set<String> unique = new LinkedHashSet<>(seats);
        if (unique.isEmpty()) {
            throw new BusinessRuleException("A booking must contain at least one seat");
        }
        if (unique.size() != seats.size()) {
            throw new BusinessRuleException("Duplicate seat numbers in the request");
        }
        if (request.numberOfTickets() != unique.size()) {
            throw new BusinessRuleException("Number of tickets (" + request.numberOfTickets()
                    + ") must match the number of selected seats (" + unique.size() + ")");
        }

        int capacity = show.getTheatre().getCapacity();
        List<String> invalid = unique.stream().filter(s -> !SeatLayout.isValid(s, capacity)).toList();
        if (!invalid.isEmpty()) {
            throw new BusinessRuleException("Invalid seat number(s) for this theatre: " + String.join(", ", invalid));
        }

        Set<String> alreadyBooked = new HashSet<>(bookingRepository.findBookedSeatNumbers(show.getId()));
        List<String> taken = unique.stream().filter(alreadyBooked::contains).toList();
        if (!taken.isEmpty()) {
            throw new ConflictException("Seat(s) already booked for this show: " + String.join(", ", taken));
        }

        // ---- Total = ticket price x number of tickets ----
        BigDecimal total = show.getTicketPrice().multiply(BigDecimal.valueOf(unique.size()));

        Booking booking = Booking.builder()
                .user(customer)
                .show(show)
                .seatNumbers(new ArrayList<>(unique))
                .numberOfTickets(unique.size())
                .totalAmount(total)
                .bookingDate(LocalDateTime.now())
                .status(BookingStatus.PENDING)
                .build();
        booking = bookingRepository.save(booking);

        log.info("Booking created: id={}, userId={}, showId={}, seats={}, total={}",
                booking.getId(), customer.getId(), show.getId(), booking.getSeatNumbers(), total);
        return EntityMapper.toBookingResponse(findWithDetails(booking.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = findWithDetails(id);
        assertOwnerOrAdmin(booking);
        return EntityMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(int page, int size) {
        User user = currentUserProvider.getCurrentUser();
        return PageResponse.of(
                bookingRepository.findByUserId(user.getId(), Paging.of(page, size, Sort.by(Sort.Direction.DESC, "bookingDate"))),
                EntityMapper::toBookingResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getAllBookings(BookingStatus status, int page, int size) {
        return PageResponse.of(
                bookingRepository.search(status, Paging.of(page, size, Sort.by(Sort.Direction.DESC, "bookingDate"))),
                EntityMapper::toBookingResponse);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        Booking booking = findWithDetails(id);
        assertOwnerOrAdmin(booking);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleException("Booking is already cancelled");
        }
        Show show = booking.getShow();
        if (show.getStatus() != ShowStatus.SCHEDULED || ShowTimes.hasStarted(show)) {
            throw new BusinessRuleException("Bookings can only be cancelled before the show starts");
        }

        cancelInternally(booking, "cancelled by user");
        return EntityMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatusUpdateRequest request) {
        Booking booking = findWithDetails(id);
        BookingStatus target = request.status();
        if (booking.getStatus() == target) {
            return EntityMapper.toBookingResponse(booking);
        }

        Payment payment = booking.getPayment();
        boolean paid = payment != null && payment.getStatus() == PaymentStatus.COMPLETED;

        switch (target) {
            case CANCELLED -> cancelInternally(booking, "cancelled by administrator");
            case CONFIRMED -> {
                if (booking.getStatus() == BookingStatus.CANCELLED) {
                    throw new BusinessRuleException("A cancelled booking cannot be re-activated");
                }
                if (!paid) {
                    throw new BusinessRuleException("A booking can only be CONFIRMED after its payment is COMPLETED");
                }
                booking.setStatus(BookingStatus.CONFIRMED);
            }
            case PENDING -> {
                if (booking.getStatus() == BookingStatus.CANCELLED) {
                    throw new BusinessRuleException("A cancelled booking cannot be re-activated");
                }
                if (paid) {
                    throw new BusinessRuleException("A booking with a COMPLETED payment cannot be set back to PENDING");
                }
                booking.setStatus(BookingStatus.PENDING);
            }
        }

        bookingRepository.save(booking);
        log.info("Booking status updated by admin: id={}, status={}", id, booking.getStatus());
        return EntityMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    public void cancelInternally(Booking booking, String reason) {
        booking.setStatus(BookingStatus.CANCELLED);
        Payment payment = booking.getPayment();
        if (payment != null) {
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                payment.setStatus(PaymentStatus.REFUNDED);
                log.info("Payment refunded: paymentId={}, bookingId={}, amount={}",
                        payment.getId(), booking.getId(), payment.getAmount());
            } else if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
            }
            paymentRepository.save(payment);
        }
        bookingRepository.save(booking);
        log.info("Booking cancelled: id={} ({})", booking.getId(), reason);
    }

    private Booking findWithDetails(Long id) {
        return bookingRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    /** Customers may only see / cancel their own bookings. Admins can access all. */
    private void assertOwnerOrAdmin(Booking booking) {
        User current = currentUserProvider.getCurrentUser();
        if (!currentUserProvider.isAdmin(current) && !Objects.equals(booking.getUser().getId(), current.getId())) {
            throw new AccessDeniedException("You can only access your own bookings");
        }
    }
}
