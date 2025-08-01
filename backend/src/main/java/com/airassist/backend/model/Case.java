package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Case {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Statuses status;

    @Enumerated(EnumType.STRING)
    private DisruptionReasons disruptionReason;

    @Column(nullable = false)
    @Size(max = 500, message = "Disruption information must be less than 1000 characters")
    private String disruptionInfo;

    @Column(nullable = false)
    @PastOrPresent
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id")
    private User assignedColleague;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    private Reservation reservation;

    @OneToMany(mappedBy = "caseEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documentList;
}
