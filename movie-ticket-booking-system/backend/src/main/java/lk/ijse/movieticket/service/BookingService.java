package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.BookingRequest;
import lk.ijse.movieticket.dto.request.BookingStatusUpdateRequest;
import lk.ijse.movieticket.dto.response.BookingResponse;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.entity.Booking;
import lk.ijse.movieticket.enums.BookingStatus;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    BookingResponse getBookingById(Long id);

    PageResponse<BookingResponse> getMyBookings(int page, int size);

    PageResponse<BookingResponse> getAllBookings(BookingStatus status, int page, int size);

    BookingResponse cancelBooking(Long id);

    BookingResponse updateBookingStatus(Long id, BookingStatusUpdateRequest request);

    /** Cancels a booking and refunds / voids its payment. Used by show cancellation as well. */
    void cancelInternally(Booking booking, String reason);
}
