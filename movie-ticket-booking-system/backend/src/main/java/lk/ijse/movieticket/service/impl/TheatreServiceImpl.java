package lk.ijse.movieticket.service.impl;

import lk.ijse.movieticket.dto.request.TheatreRequest;
import lk.ijse.movieticket.dto.response.TheatreResponse;
import lk.ijse.movieticket.entity.Show;
import lk.ijse.movieticket.entity.Theatre;
import lk.ijse.movieticket.enums.ShowStatus;
import lk.ijse.movieticket.enums.TheatreStatus;
import lk.ijse.movieticket.exception.ConflictException;
import lk.ijse.movieticket.exception.ResourceNotFoundException;
import lk.ijse.movieticket.repository.BookingRepository;
import lk.ijse.movieticket.repository.ShowRepository;
import lk.ijse.movieticket.repository.TheatreRepository;
import lk.ijse.movieticket.service.TheatreService;
import lk.ijse.movieticket.util.EntityMapper;
import lk.ijse.movieticket.util.SeatLayout;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TheatreServiceImpl implements TheatreService {

    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public TheatreResponse createTheatre(TheatreRequest request) {
        if (theatreRepository.existsByNameIgnoreCaseAndLocationIgnoreCase(request.name().trim(), request.location().trim())) {
            throw new ConflictException("A theatre with this name already exists at this location");
        }
        Theatre theatre = Theatre.builder()
                .name(request.name().trim())
                .location(request.location().trim())
                .capacity(request.capacity())
                .status(request.status())
                .build();
        theatre = theatreRepository.save(theatre);
        log.info("Theatre created: id={}, name='{}', capacity={}", theatre.getId(), theatre.getName(), theatre.getCapacity());
        return EntityMapper.toTheatreResponse(theatre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TheatreResponse> getTheatres(TheatreStatus status) {
        List<Theatre> theatres = status == null
                ? theatreRepository.findAllByOrderByNameAsc()
                : theatreRepository.findByStatusOrderByNameAsc(status);
        return theatres.stream().map(EntityMapper::toTheatreResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TheatreResponse getTheatreById(Long id) {
        return EntityMapper.toTheatreResponse(findTheatre(id));
    }

    @Override
    @Transactional
    public TheatreResponse updateTheatre(Long id, TheatreRequest request) {
        Theatre theatre = findTheatre(id);

        // Shrinking a theatre must not remove seats that are already booked for upcoming shows.
        if (request.capacity() < theatre.getCapacity()) {
            for (Show show : showRepository.findByTheatreIdAndStatus(id, ShowStatus.SCHEDULED)) {
                boolean seatLost = bookingRepository.findBookedSeatNumbers(show.getId()).stream()
                        .anyMatch(seat -> !SeatLayout.isValid(seat, request.capacity()));
                if (seatLost) {
                    throw new ConflictException("Capacity cannot be reduced to " + request.capacity()
                            + ": seats outside the new layout are already booked for show #" + show.getId());
                }
            }
        }

        theatre.setName(request.name().trim());
        theatre.setLocation(request.location().trim());
        theatre.setCapacity(request.capacity());
        theatre.setStatus(request.status());
        log.info("Theatre updated: id={}, status={}", id, theatre.getStatus());
        return EntityMapper.toTheatreResponse(theatreRepository.save(theatre));
    }

    @Override
    @Transactional
    public void deleteTheatre(Long id) {
        Theatre theatre = findTheatre(id);
        if (showRepository.existsByTheatreId(id)) {
            throw new ConflictException("Theatre has shows and cannot be deleted. Set its status to INACTIVE instead.");
        }
        theatreRepository.delete(theatre);
        log.info("Theatre deleted: id={}", id);
    }

    private Theatre findTheatre(Long id) {
        return theatreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Theatre", id));
    }
}
