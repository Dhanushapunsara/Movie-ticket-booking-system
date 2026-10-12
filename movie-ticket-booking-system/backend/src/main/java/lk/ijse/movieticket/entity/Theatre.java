package lk.ijse.movieticket.entity;

import jakarta.persistence.*;
import lk.ijse.movieticket.enums.TheatreStatus;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "theatres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Theatre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 150)
    private String location;

    /** Total number of seats. Seats are laid out in rows of 10: A1..A10, B1..B10 ... */
    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TheatreStatus status;

    /** Theatre 1:M Show */
    @OneToMany(mappedBy = "theatre", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Show> shows = new ArrayList<>();
}
