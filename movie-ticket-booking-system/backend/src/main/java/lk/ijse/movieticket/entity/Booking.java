package lk.ijse.movieticket.entity;

import jakarta.persistence.*;
import lk.ijse.movieticket.enums.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Booking M:1 User */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bookings_user"))
    private User user;

    /** Booking M:1 Show */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "show_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bookings_show"))
    private Show show;

    /**
     * Selected seat numbers (e.g. A1, A2). Stored in the "booking_seats"
     * collection table owned by the Booking entity.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "booking_seats",
            joinColumns = @JoinColumn(name = "booking_id"),
            foreignKey = @ForeignKey(name = "fk_booking_seats_booking"))
    @Column(name = "seat_number", nullable = false, length = 10)
    @Builder.Default
    private List<String> seatNumbers = new ArrayList<>();

    @Column(name = "number_of_tickets", nullable = false)
    private Integer numberOfTickets;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    /** Booking 1:1 Payment (Payment owns the foreign key) */
    @OneToOne(mappedBy = "booking", fetch = FetchType.LAZY)
    private Payment payment;
}
