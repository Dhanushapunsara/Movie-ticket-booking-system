package lk.ijse.movieticket.config;

import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.Role;
import lk.ijse.movieticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the default ADMIN account on first start-up, so there is always someone who can
 * manage movies/theatres/shows. Credentials come from application.properties (app.admin.*).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Default admin account already exists ({})", adminEmail);
            return;
        }
        userRepository.save(User.builder()
                .fullName(adminFullName)
                .email(adminEmail.toLowerCase())
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build());
        log.info("Default admin account created: {} (change the password after first sign-in)", adminEmail);
    }
}
