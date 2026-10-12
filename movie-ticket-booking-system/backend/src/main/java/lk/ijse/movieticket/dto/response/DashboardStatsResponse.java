package lk.ijse.movieticket.dto.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalUsers,
        long totalCustomers,
        long totalMovies,
        long nowShowingMovies,
        long totalTheatres,
        long totalShows,
        long scheduledShows,
        long totalBookings,
        long pendingBookings,
        long confirmedBookings,
        long cancelledBookings,
        long completedPayments,
        BigDecimal totalRevenue
) {
}
