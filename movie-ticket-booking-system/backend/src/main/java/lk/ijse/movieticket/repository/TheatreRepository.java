package lk.ijse.movieticket.repository;

import lk.ijse.movieticket.entity.Theatre;
import lk.ijse.movieticket.enums.TheatreStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheatreRepository extends JpaRepository<Theatre, Long> {

    List<Theatre> findAllByOrderByNameAsc();

    List<Theatre> findByStatusOrderByNameAsc(TheatreStatus status);

    boolean existsByNameIgnoreCaseAndLocationIgnoreCase(String name, String location);
}
