package lk.ijse.movieticket.util;

import lk.ijse.movieticket.dto.response.SeatAvailabilityResponse.SeatRow;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Seat numbering derived from a theatre's capacity.
 * Seats are laid out in rows of {@link #SEATS_PER_ROW}: A1..A10, B1..B10, ... Z1..Z10, AA1 ...
 * The last row may be shorter when capacity is not a multiple of 10.
 */
public final class SeatLayout {

    public static final int SEATS_PER_ROW = 10;
    private static final Pattern SEAT_PATTERN = Pattern.compile("^([A-Z]{1,2})([1-9][0-9]?)$");

    private SeatLayout() {
    }

    public static List<SeatRow> generate(int capacity) {
        List<SeatRow> rows = new ArrayList<>();
        int rowCount = (int) Math.ceil(capacity / (double) SEATS_PER_ROW);
        for (int r = 0; r < rowCount; r++) {
            String label = rowLabel(r);
            int seatsInRow = Math.min(SEATS_PER_ROW, capacity - r * SEATS_PER_ROW);
            List<String> seats = new ArrayList<>(seatsInRow);
            for (int s = 1; s <= seatsInRow; s++) {
                seats.add(label + s);
            }
            rows.add(new SeatRow(label, seats));
        }
        return rows;
    }

    /** "a1 " -> "A1" */
    public static String normalize(String seat) {
        return seat == null ? "" : seat.trim().toUpperCase();
    }

    /** True if the seat exists in a theatre with the given capacity. */
    public static boolean isValid(String seat, int capacity) {
        Matcher m = SEAT_PATTERN.matcher(normalize(seat));
        if (!m.matches()) {
            return false;
        }
        int rowIndex = rowIndex(m.group(1));
        int seatNo = Integer.parseInt(m.group(2));
        if (seatNo > SEATS_PER_ROW) {
            return false;
        }
        int position = rowIndex * SEATS_PER_ROW + seatNo; // 1-based overall position
        return position <= capacity;
    }

    /** 0 -> A, 25 -> Z, 26 -> AA, 27 -> AB ... */
    static String rowLabel(int index) {
        if (index < 26) {
            return String.valueOf((char) ('A' + index));
        }
        int first = index / 26 - 1;
        int second = index % 26;
        return "" + (char) ('A' + first) + (char) ('A' + second);
    }

    static int rowIndex(String label) {
        if (label.length() == 1) {
            return label.charAt(0) - 'A';
        }
        return (label.charAt(0) - 'A' + 1) * 26 + (label.charAt(1) - 'A');
    }
}
