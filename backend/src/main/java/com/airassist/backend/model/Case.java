package com.airassist.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    private Date date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(referencedColumnName = "id")
    private User assignedColleague;

    @OneToOne
    @JoinColumn(referencedColumnName = "id", nullable = false)
    private Reservation reservation;

    @OneToMany(mappedBy = "caseEntity")
    private List<Document> documentList;
}
