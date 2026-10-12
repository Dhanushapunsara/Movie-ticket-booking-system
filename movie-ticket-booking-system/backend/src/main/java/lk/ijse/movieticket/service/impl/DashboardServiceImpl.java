package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.response.DashboardStatsResponse;
import lk.ijse.movieticket.enums.*;
import lk.ijse.movieticket.repository.*;
import lk.ijse.movieticket.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        return new DashboardStatsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.CUSTOMER),
                movieRepository.count(),
                movieRepository.countByStatus(MovieStatus.NOW_SHOWING),
                theatreRepository.count(),
                showRepository.count(),
                showRepository.countByStatus(ShowStatus.SCHEDULED),
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.CONFIRMED),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                paymentRepository.countByStatus(PaymentStatus.COMPLETED),
                paymentRepository.totalRevenue());
    }
}
