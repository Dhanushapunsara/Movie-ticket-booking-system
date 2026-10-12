package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.SignInRequest;
import lk.ijse.movieticket.dto.request.SignUpRequest;
import lk.ijse.movieticket.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse signUp(SignUpRequest request);

    AuthResponse signIn(SignInRequest request);
}
