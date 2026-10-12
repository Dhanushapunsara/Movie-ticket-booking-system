package lk.ijse.movieticket.service;

import lk.ijse.movieticket.dto.request.UserUpdateRequest;
import lk.ijse.movieticket.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse getCurrentUser();

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);
}
