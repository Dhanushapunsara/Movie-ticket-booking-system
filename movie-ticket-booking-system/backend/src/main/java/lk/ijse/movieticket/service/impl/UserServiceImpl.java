package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.UserUpdateRequest;
import lk.ijse.movieticket.dto.response.UserResponse;
import lk.ijse.movieticket.entity.User;
import lk.ijse.movieticket.enums.Role;
import lk.ijse.movieticket.exception.BusinessRuleException;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.exception.ResourceNotFoundException;
import lk.ijse.movieticket.repository.BookingRepository;
import lk.ijse.movieticket.repository.UserRepository;
import lk.ijse.movieticket.security.CurrentUserProvider;
import lk.ijse.movieticket.service.UserService;
import lk.ijse.movieticket.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll(Sort.by("id")).stream().map(EntityMapper::toUserResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User current = currentUserProvider.getCurrentUser();
        assertSelfOrAdmin(current, id);
        return EntityMapper.toUserResponse(findUser(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return EntityMapper.toUserResponse(currentUserProvider.getCurrentUser());
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User current = currentUserProvider.getCurrentUser();
        assertSelfOrAdmin(current, id);
        User user = findUser(id);

        user.setFullName(request.fullName().trim());
        user.setPhone(StringUtils.hasText(request.phone()) ? request.phone().trim() : null);
        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        // Only an admin may change roles, and an admin can't demote themself (avoids locking everyone out).
        if (request.role() != null && request.role() != user.getRole()) {
            if (!currentUserProvider.isAdmin(current)) {
                throw new AccessDeniedException("Only an administrator can change user roles");
            }
            if (Objects.equals(current.getId(), user.getId())) {
                throw new BusinessRuleException("You cannot change your own role");
            }
            user.setRole(request.role());
        }

        log.info("User updated: id={} by userId={}", id, current.getId());
        return EntityMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User current = currentUserProvider.getCurrentUser();
        User user = findUser(id);
        if (Objects.equals(current.getId(), user.getId())) {
            throw new BusinessRuleException("You cannot delete your own account");
        }
        if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new BusinessRuleException("The last administrator account cannot be deleted");
        }
        if (bookingRepository.existsByUserId(id)) {
            throw new ConflictException("User has bookings and cannot be deleted (booking history must be kept)");
        }
        userRepository.delete(user);
        log.info("User deleted: id={} by adminId={}", id, current.getId());
    }

    private User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private void assertSelfOrAdmin(User current, Long targetId) {
        if (!currentUserProvider.isAdmin(current) && !Objects.equals(current.getId(), targetId)) {
            throw new AccessDeniedException("You can only access your own account");
        }
    }
}
