package lk.ijse.movieticket.repository;

import lk.ijse.movieticket.entity.Booking;
import lk.ijse.movieticket.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"user", "show", "show.movie", "show.theatre", "payment"})
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findWithDetailsById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"user", "show", "show.movie", "show.theatre", "payment"})
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "show", "show.movie", "show.theatre", "payment"})
    @Query("SELECT b FROM Booking b WHERE (:status IS NULL OR b.status = :status)")
    Page<Booking> search(@Param("status") BookingStatus status, Pageable pageable);

    /** All seats already taken for a show (cancelled bookings release their seats). */
    @Query("""
            SELECT seat FROM Booking b JOIN b.seatNumbers seat
            WHERE b.show.id = :showId AND b.status <> lk.ijse.movieticket.enums.BookingStatus.CANCELLED
            """)
    List<String> findBookedSeatNumbers(@Param("showId") Long showId);

    @Query("""
            SELECT COUNT(seat) FROM Booking b JOIN b.seatNumbers seat
            WHERE b.show.id = :showId AND b.status <> lk.ijse.movieticket.enums.BookingStatus.CANCELLED
            """)
    long countBookedSeats(@Param("showId") Long showId);

    List<Booking> findByShowIdAndStatusNot(Long showId, BookingStatus status);

    boolean existsByUserId(Long userId);

    boolean existsByShowId(Long showId);

    long countByStatus(BookingStatus status);
}
