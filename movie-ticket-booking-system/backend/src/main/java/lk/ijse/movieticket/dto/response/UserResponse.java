package lk.ijse.movieticket.dto.response;

import lk.ijse.movieticket.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        Role role,
        LocalDateTime createdAt
) {
}
