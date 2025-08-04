package com.airassist.backend.dto.cases;

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
    private UUID clientId;
    private UUID assignedColleagueId;
    private UUID reservationId;
    private List<UUID> documentIds;
}