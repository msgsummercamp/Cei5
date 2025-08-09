package com.airassist.backend.dto.cases;

import com.airassist.backend.dto.beneficiary.BeneficiaryDTO;
import com.airassist.backend.dto.reservation.ReservationDTO;
import com.airassist.backend.dto.user.UserDTO;
import com.airassist.backend.model.*;
import com.airassist.backend.model.enums.DisruptionReasons;
import com.airassist.backend.model.enums.Statuses;
import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CaseDTO {
    @Enumerated(EnumType.STRING)
    private Statuses status;

    @Enumerated(EnumType.STRING)
    private DisruptionReasons disruptionReason;

    @Size(max = 500, message = "Disruption information must be less than 1000 characters")
    private String disruptionInfo;

    @PastOrPresent
    private LocalDate date;

    private UUID clientID;

    private UserDTO assignedColleague;

    private ReservationDTO reservation;

    private BeneficiaryDTO beneficiary;

    /// TODO: create Document DTO and use it instead of Document class
    private List<Document> documentList;
}
