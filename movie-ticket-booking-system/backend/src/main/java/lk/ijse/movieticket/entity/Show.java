package lk.ijse.movieticket.entity;

import jakarta.persistence.*;
import lk.ijse.movieticket.enums.ShowStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A screening of a movie in a theatre at a given date & time.
 * Table is named "shows" because SHOW is a reserved word in MySQL.
 */
@Entity
@Table(name = "shows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Show M:1 Movie */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false, foreignKey = @ForeignKey(name = "fk_shows_movie"))
    private Movie movie;

    /** Show M:1 Theatre */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "theatre_id", nullable = false, foreignKey = @ForeignKey(name = "fk_shows_theatre"))
    private Theatre theatre;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "show_time", nullable = false)
    private LocalTime showTime;

    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShowStatus status;

    /** Show 1:M Booking */
    @OneToMany(mappedBy = "show", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
