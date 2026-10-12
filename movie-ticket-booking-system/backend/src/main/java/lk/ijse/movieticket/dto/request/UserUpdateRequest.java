package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lk.ijse.movieticket.enums.Role;

/**
 * Profile update. {@code role} is only applied when an ADMIN makes the request.
 * {@code password} is optional - leave it empty to keep the current password.
 */
public record UserUpdateRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        String fullName,

        @Pattern(regexp = "^$|^\\+?[0-9]{9,15}$", message = "Phone must be 9-15 digits")
        String phone,

        Role role,

        @Pattern(regexp = "^$|^.{6,64}$", message = "Password must be 6-64 characters")
        String password
) {
}
