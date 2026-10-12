package lk.ijse.movieticket.util;

import lk.ijse.movieticket.dto.response.*;
import lk.ijse.movieticket.entity.*;
import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.PaymentStatus;
import lk.ijse.movieticket.enums.ShowStatus;

import java.util.List;

/** Converts entities to response DTOs so entities never leak out of the service layer. */
public final class EntityMapper {

    private EntityMapper() {
    }

    public static UserResponse toUserResponse(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole(), u.getCreatedAt());
    }

    public static MovieResponse toMovieResponse(Movie m) {
        return new MovieResponse(m.getId(), m.getTitle(), m.getDescription(), m.getDurationMinutes(),
                m.getLanguage(), m.getGenre(), m.getReleaseDate(), m.getPosterUrl(), m.getStatus());
    }

    public static TheatreResponse toTheatreResponse(Theatre t) {
        return new TheatreResponse(t.getId(), t.getName(), t.getLocation(), t.getCapacity(), t.getStatus());
    }

    public static ShowResponse toShowResponse(Show s, long bookedSeats) {
        Movie m = s.getMovie();
        Theatre t = s.getTheatre();
        long available = Math.max(0, t.getCapacity() - bookedSeats);
        boolean bookable = ShowTimes.isBookable(s) && available > 0;
        return new ShowResponse(s.getId(),
                m.getId(), m.getTitle(), m.getPosterUrl(), m.getDurationMinutes(), m.getLanguage(), m.getGenre(),
                t.getId(), t.getName(), t.getLocation(), t.getCapacity(),
                s.getShowDate(), s.getShowTime(), ShowTimes.endTime(s), s.getTicketPrice(), s.getStatus(),
                bookedSeats, available, bookable);
    }

    public static BookingResponse toBookingResponse(Booking b) {
        Show s = b.getShow();
        Payment p = b.getPayment();
        PaymentStatus paymentStatus = p == null ? null : p.getStatus();

        boolean cancellable = b.getStatus() != BookingStatus.CANCELLED
                && s.getStatus() == ShowStatus.SCHEDULED
                && !ShowTimes.hasStarted(s);
        boolean payable = b.getStatus() == BookingStatus.PENDING
                && ShowTimes.isBookable(s)
                && (paymentStatus == null || paymentStatus == PaymentStatus.PENDING || paymentStatus == PaymentStatus.FAILED);

        return new BookingResponse(b.getId(),
                b.getUser().getId(), b.getUser().getFullName(), b.getUser().getEmail(),
                s.getId(), s.getMovie().getId(), s.getMovie().getTitle(), s.getMovie().getPosterUrl(),
                s.getTheatre().getName(), s.getTheatre().getLocation(),
                s.getShowDate(), s.getShowTime(), s.getTicketPrice(),
                List.copyOf(b.getSeatNumbers()), b.getNumberOfTickets(), b.getTotalAmount(), b.getBookingDate(),
                b.getStatus(), p == null ? null : p.getId(), paymentStatus, cancellable, payable);
    }

    public static PaymentResponse toPaymentResponse(Payment p) {
        Booking b = p.getBooking();
        return new PaymentResponse(p.getId(), b.getId(), b.getStatus(),
                b.getUser().getId(), b.getUser().getFullName(), b.getShow().getMovie().getTitle(),
                List.copyOf(b.getSeatNumbers()), p.getAmount(), p.getPaymentMethod(), p.getStatus(),
                p.getPaymentDate(), p.getTransactionReference(), p.getCreatedAt());
    }
}
