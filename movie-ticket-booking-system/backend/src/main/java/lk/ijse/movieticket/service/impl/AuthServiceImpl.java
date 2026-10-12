package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.SignInRequest;
import lk.ijse.movieticket.dto.request.SignUpRequest;
import lk.ijse.movieticket.dto.response.AuthResponse;
import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.Role;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.repository.UserRepository;
import lk.ijse.movieticket.security.JwtService;
import lk.ijse.movieticket.service.AuthService;
import lk.ijse.movieticket.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with email '" + email + "' already exists");
        }

        // Public sign-up always creates CUSTOMER accounts; admins are promoted by another admin.
        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .phone(StringUtils.hasText(request.phone()) ? request.phone().trim() : null)
                .role(Role.CUSTOMER)
                .build();
        user = userRepository.save(user);
        log.info("New customer registered: id={}, email={}", user.getId(), user.getEmail());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse signIn(SignInRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        log.info("User signed in: id={}, role={}", user.getId(), user.getRole());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", jwtService.getExpiration(token), EntityMapper.toUserResponse(user));
    }
}
