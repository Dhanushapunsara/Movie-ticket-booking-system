package lk.ijse.movieticket.util;

import lk.ijse.movieticket.entity.Show;
import lk.ijse.movieticket.enums.ShowStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;

/** Small helpers for working with a show's start/end time. */
public final class ShowTimes {

    /** Cleaning / ad break kept free between two shows in the same theatre. */
    public static final int BUFFER_MINUTES = 15;

    private ShowTimes() {
    }

    public static LocalDateTime start(Show show) {
        return LocalDateTime.of(show.getShowDate(), show.getShowTime());
    }

    public static LocalDateTime end(Show show) {
        return start(show).plusMinutes(show.getMovie().getDurationMinutes());
    }

    public static LocalTime endTime(Show show) {
        return end(show).toLocalTime();
    }

    public static boolean hasStarted(Show show) {
        return !start(show).isAfter(LocalDateTime.now());
    }

    /** A show accepts bookings only when it is SCHEDULED and hasn't started yet. */
    public static boolean isBookable(Show show) {
        return show.getStatus() == ShowStatus.SCHEDULED && !hasStarted(show);
    }
}
