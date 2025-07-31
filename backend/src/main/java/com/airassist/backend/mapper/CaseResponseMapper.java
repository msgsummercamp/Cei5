package com.airassist.backend.mapper;

import com.airassist.backend.dto.cases.CaseResponseDTO;
import com.airassist.backend.model.Case;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CaseResponseMapper {
    CaseResponseDTO toCaseResponseDTO(Case caseEntity);
}