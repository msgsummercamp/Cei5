package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "case_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Case {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // later import
    @Enumerated(EnumType.STRING)
    private Statuses status;

    @Enumerated(EnumType.STRING)
    private DisruptionReasons disruptionReason;

    @Column(nullable = false)
    @Size(max = 500, message = "Disruption information must be less than 1000 characters")
    private String disruptionInfo;

    @Column(nullable = false)
    @PastOrPresent
    private Date date;

    // later import
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    private User user;

    // later import
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id")
    private User colleague;

    @OneToOne
    @JoinColumn(referencedColumnName = "reservation_number", nullable = false)
    private Reservation reservation;

    @OneToOne
    @JoinColumn(referencedColumnName = "id")
    private Documents document;
}
