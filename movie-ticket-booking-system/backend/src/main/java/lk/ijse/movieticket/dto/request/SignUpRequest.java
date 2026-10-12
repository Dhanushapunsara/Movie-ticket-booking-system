package lk.ijse.movieticket.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignUpRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 100, message = "Email must be at most 100 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 64, message = "Password must be 6-64 characters")
        String password,

        @Pattern(regexp = "^$|^\\+?[0-9]{9,15}$", message = "Phone must be 9-15 digits")
        String phone
) {
}
