package lk.ijse.movieticket.controller;

import jakarta.validation.Valid;
import lk.ijse.movieticket.dto.request.SignInRequest;
import lk.ijse.movieticket.dto.request.SignUpRequest;
import lk.ijse.movieticket.dto.response.AuthResponse;
import lk.ijse.movieticket.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Register a new CUSTOMER account. Returns a JWT so the user is signed in straight away. */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signUp(request));
    }

    /** Authenticate and receive a JWT. */
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signIn(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(authService.signIn(request));
    }
}
