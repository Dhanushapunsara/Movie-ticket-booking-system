package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.ShowRequest;
import lk.ijse.movieticket.dto.response.PageResponse;
import lk.ijse.movieticket.dto.response.SeatAvailabilityResponse;
import lk.ijse.movieticket.dto.response.ShowResponse;
import lk.ijse.movieticket.entity.Booking;
import lk.ijse.movieticket.entity.Movie;
import lk.ijse.movieticket.entity.Show;
import lk.ijse.movieticket.entity.Theatre;
import lk.ijse.movieticket.enums.BookingStatus;
import lk.ijse.movieticket.enums.MovieStatus;
import lk.ijse.movieticket.enums.ShowStatus;
import lk.ijse.movieticket.enums.TheatreStatus;
import lk.ijse.movieticket.exception.BusinessRuleException;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.exception.ResourceNotFoundException;
import lk.ijse.movieticket.repository.BookingRepository;
import lk.ijse.movieticket.repository.MovieRepository;
import lk.ijse.movieticket.repository.ShowRepository;
import lk.ijse.movieticket.repository.TheatreRepository;
import lk.ijse.movieticket.service.BookingService;
import lk.ijse.movieticket.service.ShowService;
import lk.ijse.movieticket.util.EntityMapper;
import lk.ijse.movieticket.util.Paging;
import lk.ijse.movieticket.util.SeatLayout;
import lk.ijse.movieticket.util.ShowTimes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShowServiceImpl implements ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @Override
    @Transactional
    public ShowResponse createShow(ShowRequest request) {
        Movie movie = findMovie(request.movieId());
        Theatre theatre = findTheatre(request.theatreId());

        // Business rules
        if (movie.getStatus() == MovieStatus.ENDED) {
            throw new BusinessRuleException("Cannot create a show for movie '" + movie.getTitle() + "' because it has ENDED");
        }
        if (theatre.getStatus() != TheatreStatus.ACTIVE) {
            throw new BusinessRuleException("Shows can only be created for an ACTIVE theatre");
        }
        if (!LocalDateTime.of(request.showDate(), request.showTime()).isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Show date and time must be in the future");
        }

        Show show = Show.builder()
                .movie(movie)
                .theatre(theatre)
                .showDate(request.showDate())
                .showTime(request.showTime())
                .ticketPrice(request.ticketPrice())
                .status(ShowStatus.SCHEDULED)
                .build();
        assertNoScheduleConflict(show);

        show = showRepository.save(show);
        log.info("Show created: id={}, movie='{}', theatre='{}', {} {}", show.getId(), movie.getTitle(),
                theatre.getName(), show.getShowDate(), show.getShowTime());
        return EntityMapper.toShowResponse(show, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShowResponse> getShows(Long movieId, Long theatreId, LocalDate date, ShowStatus status,
                                               boolean upcomingOnly, int page, int size) {
        Sort sort = Sort.by("showDate").ascending().and(Sort.by("showTime").ascending());
        LocalDate fromDate = upcomingOnly ? LocalDate.now() : null;
        return PageResponse.of(
                showRepository.search(movieId, theatreId, date, status, fromDate, Paging.of(page, size, sort)),
                this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ShowResponse getShowById(Long id) {
        return toResponse(findShowWithDetails(id));
    }

    @Override
    @Transactional
    public ShowResponse updateShow(Long id, ShowRequest request) {
        Show show = findShowWithDetails(id);
        Movie movie = findMovie(request.movieId());
        Theatre theatre = findTheatre(request.theatreId());

        boolean scheduleChanged = !Objects.equals(show.getMovie().getId(), movie.getId())
                || !Objects.equals(show.getTheatre().getId(), theatre.getId())
                || !show.getShowDate().equals(request.showDate())
                || !show.getShowTime().equals(request.showTime());

        if (scheduleChanged) {
            if (bookingRepository.countBookedSeats(id) > 0) {
                throw new ConflictException("This show already has bookings, so its movie, theatre, date and time "
                        + "cannot be changed. Cancel the show and create a new one instead.");
            }
            if (!Objects.equals(show.getMovie().getId(), movie.getId()) && movie.getStatus() == MovieStatus.ENDED) {
                throw new BusinessRuleException("Cannot move a show to a movie that has ENDED");
            }
            if (!Objects.equals(show.getTheatre().getId(), theatre.getId()) && theatre.getStatus() != TheatreStatus.ACTIVE) {
                throw new BusinessRuleException("Shows can only be moved to an ACTIVE theatre");
            }
            if (!LocalDateTime.of(request.showDate(), request.showTime()).isAfter(LocalDateTime.now())) {
                throw new BusinessRuleException("Show date and time must be in the future");
            }
        }

        ShowStatus newStatus = request.status() == null ? show.getStatus() : request.status();
        ShowStatus oldStatus = show.getStatus();

        show.setMovie(movie);
        show.setTheatre(theatre);
        show.setShowDate(request.showDate());
        show.setShowTime(request.showTime());
        show.setTicketPrice(request.ticketPrice());
        show.setStatus(newStatus);

        if (scheduleChanged || (oldStatus != ShowStatus.SCHEDULED && newStatus == ShowStatus.SCHEDULED)) {
            assertNoScheduleConflict(show);
        }

        // Cancelling a show cancels all of its active bookings (and refunds completed payments).
        if (oldStatus != ShowStatus.CANCELLED && newStatus == ShowStatus.CANCELLED) {
            List<Booking> active = bookingRepository.findByShowIdAndStatusNot(id, BookingStatus.CANCELLED);
            active.forEach(b -> bookingService.cancelInternally(b, "show #" + id + " was cancelled"));
            log.info("Show cancelled: id={}, {} booking(s) cancelled", id, active.size());
        }

        show = showRepository.save(show);
        log.info("Show updated: id={}, status={}", id, show.getStatus());
        return toResponse(show);
    }

    @Override
    @Transactional
    public void deleteShow(Long id) {
        Show show = showRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Show", id));
        if (bookingRepository.existsByShowId(id)) {
            throw new ConflictException("Show has bookings and cannot be deleted. Set its status to CANCELLED instead.");
        }
        showRepository.delete(show);
        log.info("Show deleted: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public SeatAvailabilityResponse getSeatAvailability(Long showId) {
        Show show = findShowWithDetails(showId);
        int capacity = show.getTheatre().getCapacity();
        List<String> booked = bookingRepository.findBookedSeatNumbers(showId).stream().sorted().toList();
        int available = Math.max(0, capacity - booked.size());
        return new SeatAvailabilityResponse(showId, capacity, SeatLayout.SEATS_PER_ROW, SeatLayout.generate(capacity),
                booked, available, show.getTicketPrice(), ShowTimes.isBookable(show) && available > 0);
    }

    /**
     * Same theatre must not have overlapping shows. Two shows overlap when their running times
     * (plus a {@value ShowTimes#BUFFER_MINUTES}-minute cleaning buffer) intersect.
     */
    private void assertNoScheduleConflict(Show candidate) {
        if (candidate.getStatus() == ShowStatus.CANCELLED) {
            return;
        }
        LocalDateTime start = ShowTimes.start(candidate);
        LocalDateTime end = ShowTimes.end(candidate).plusMinutes(ShowTimes.BUFFER_MINUTES);

        List<Show> nearby = showRepository.findByTheatreIdAndShowDateBetweenAndStatusNot(
                candidate.getTheatre().getId(), candidate.getShowDate().minusDays(1),
                candidate.getShowDate().plusDays(1), ShowStatus.CANCELLED);

        for (Show other : nearby) {
            if (candidate.getId() != null && candidate.getId().equals(other.getId())) {
                continue;
            }
            LocalDateTime otherStart = ShowTimes.start(other);
            LocalDateTime otherEnd = ShowTimes.end(other).plusMinutes(ShowTimes.BUFFER_MINUTES);
            if (start.isBefore(otherEnd) && otherStart.isBefore(end)) {
                throw new ConflictException(String.format(
                        "Schedule conflict: theatre '%s' already has '%s' on %s from %s to %s",
                        candidate.getTheatre().getName(), other.getMovie().getTitle(), other.getShowDate(),
                        other.getShowTime(), ShowTimes.endTime(other)));
            }
        }
    }

    private ShowResponse toResponse(Show show) {
        return EntityMapper.toShowResponse(show, bookingRepository.countBookedSeats(show.getId()));
    }

    private Show findShowWithDetails(Long id) {
        return showRepository.findWithDetailsById(id).orElseThrow(() -> new ResourceNotFoundException("Show", id));
    }

    private Movie findMovie(Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Movie", id));
    }

    private Theatre findTheatre(Long id) {
        return theatreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Theatre", id));
    }
}
