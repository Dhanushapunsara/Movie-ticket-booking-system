package lk.ijse.movieticket.entity;

import jakarta.persistence.*;
import lk.ijse.movieticket.enums.PaymentMethod;
import lk.ijse.movieticket.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", uniqueConstraints = @UniqueConstraint(name = "uk_payments_booking", columnNames = "booking_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Payment 1:1 Booking */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payments_booking"))
    private Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /** Set when the payment is processed (completed / failed). */
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "transaction_reference", length = 50)
    private String transactionReference;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
