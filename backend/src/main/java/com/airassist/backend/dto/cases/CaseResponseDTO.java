package com.airassist.backend.dto.cases;

import com.airassist.backend.dto.beneficiary.BeneficiaryDTO;
import com.airassist.backend.dto.reservation.ReservationDTO;
import com.airassist.backend.dto.user.UserResponseDTO;
import com.airassist.backend.model.enums.Statuses;
import com.airassist.backend.model.enums.DisruptionReasons;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CaseResponseDTO {
    private UUID id;
    private Statuses status;
    private DisruptionReasons disruptionReason;
    private String disruptionInfo;
    private LocalDate date;
    private UserResponseDTO client;
    private UserResponseDTO assignedColleague;
    private ReservationDTO reservation;
    private BeneficiaryDTO beneficiary;
    private List<UUID> documentIds;
}