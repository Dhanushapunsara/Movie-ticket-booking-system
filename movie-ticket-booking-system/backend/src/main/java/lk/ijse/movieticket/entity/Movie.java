package lk.ijse.movieticket.entity;

import jakarta.persistence.*;
import lk.ijse.movieticket.enums.MovieStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    /** Duration in minutes */
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(nullable = false, length = 50)
    private String genre;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MovieStatus status;

    /** Movie 1:M Show */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Show> shows = new ArrayList<>();
}
