package lk.ijse.movieticket.dto.response;

import java.time.Instant;

public record AuthResponse(
        String token,
        String tokenType,
        Instant expiresAt,
        UserResponse user
) {
}
