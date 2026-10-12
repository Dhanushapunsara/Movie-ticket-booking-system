package lk.ijse.movieticket.repository;

import lk.ijse.movieticket.entity.Movie;
import lk.ijse.movieticket.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    /** Advanced search: every filter is optional (null = ignored). */
    @Query("""
            SELECT m FROM Movie m
            WHERE (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
              AND (:language IS NULL OR LOWER(m.language) = LOWER(:language))
              AND (:genre IS NULL OR LOWER(m.genre) = LOWER(:genre))
              AND (:status IS NULL OR m.status = :status)
            """)
    Page<Movie> search(@Param("title") String title,
                       @Param("language") String language,
                       @Param("genre") String genre,
                       @Param("status") MovieStatus status,
                       Pageable pageable);

    long countByStatus(MovieStatus status);
}
