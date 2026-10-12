package lk.ijse.movieticket.repository;

import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(Role role);
}
