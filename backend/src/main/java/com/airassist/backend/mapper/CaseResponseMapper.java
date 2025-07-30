package com.airassist.backend.mapper;

import com.airassist.backend.dto.CaseResponseDTO;
import com.airassist.backend.model.Case;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CaseResponseMapper {
    @Mapping(source = "id", target = "id")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "disruptionReason", target = "disruptionReason")
    @Mapping(source = "disruptionInfo", target = "disruptionInfo")
    @Mapping(source = "date", target = "date")
    @Mapping(source = "client.id", target = "clientId")
    @Mapping(source = "assignedColleague.id", target = "assignedColleagueId")
    @Mapping(source = "reservation.id", target = "reservationId")
    @Mapping(target = "documentIds", expression = "java(caseEntity.getDocumentList() != null ? caseEntity.getDocumentList().stream().map(doc -> doc.getId()).toList() : null)")
    CaseResponseDTO toCaseResponseDTO(Case caseEntity);
}