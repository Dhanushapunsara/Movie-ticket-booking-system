package lk.ijse.movieticket.repository;

import lk.ijse.movieticket.entity.Payment;
import lk.ijse.movieticket.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.show", "booking.show.movie"})
    @Query("SELECT p FROM Payment p WHERE p.id = :id")
    Optional<Payment> findWithDetailsById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.show", "booking.show.movie"})
    Optional<Payment> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.show", "booking.show.movie"})
    @Query("SELECT p FROM Payment p WHERE (:status IS NULL OR p.status = :status)")
    Page<Payment> search(@Param("status") PaymentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"booking", "booking.user", "booking.show", "booking.show.movie"})
    Page<Payment> findByBookingUserId(Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = lk.ijse.movieticket.enums.PaymentStatus.COMPLETED")
    BigDecimal totalRevenue();

    long countByStatus(PaymentStatus status);
}
