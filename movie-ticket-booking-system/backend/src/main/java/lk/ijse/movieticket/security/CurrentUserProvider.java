package lk.ijse.movieticket.security;

import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.Role;
import lk.ijse.movieticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Gives services access to the currently authenticated user. */
@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user no longer exists"));
    }

    public boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }
}
