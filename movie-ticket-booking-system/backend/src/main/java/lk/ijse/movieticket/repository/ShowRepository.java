package lk.ijse.movieticket.repository;

import jakarta.persistence.LockModeType;
import lk.ijse.movieticket.entity.Show;
import lk.ijse.movieticket.enums.ShowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    /** Filter shows by movie / theatre / date / status. Every filter is optional. */
    @EntityGraph(attributePaths = {"movie", "theatre"})
    @Query("""
            SELECT s FROM Show s
            WHERE (:movieId IS NULL OR s.movie.id = :movieId)
              AND (:theatreId IS NULL OR s.theatre.id = :theatreId)
              AND (:showDate IS NULL OR s.showDate = :showDate)
              AND (:status IS NULL OR s.status = :status)
              AND (:fromDate IS NULL OR s.showDate >= :fromDate)
            """)
    Page<Show> search(@Param("movieId") Long movieId,
                      @Param("theatreId") Long theatreId,
                      @Param("showDate") LocalDate showDate,
                      @Param("status") ShowStatus status,
                      @Param("fromDate") LocalDate fromDate,
                      Pageable pageable);

    @EntityGraph(attributePaths = {"movie", "theatre"})
    @Query("SELECT s FROM Show s WHERE s.id = :id")
    Optional<Show> findWithDetailsById(@Param("id") Long id);

    /** Locks the show row while a booking is being created so two customers can't grab the same seat. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Show s WHERE s.id = :id")
    Optional<Show> findByIdForUpdate(@Param("id") Long id);

    /** Shows in the same theatre around a date (used for the time-conflict check, incl. late-night shows). */
    @EntityGraph(attributePaths = {"movie"})
    List<Show> findByTheatreIdAndShowDateBetweenAndStatusNot(Long theatreId, LocalDate from, LocalDate to, ShowStatus status);

    List<Show> findByTheatreIdAndStatus(Long theatreId, ShowStatus status);

    boolean existsByMovieId(Long movieId);

    boolean existsByTheatreId(Long theatreId);

    long countByStatus(ShowStatus status);
}
