package com.airassist.backend.mapper;

import com.airassist.backend.dto.CaseResponseDTO;
import com.airassist.backend.model.Case;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CaseResponseMapper {
    CaseResponseDTO toCaseResponseDTO(Case caseEntity);
}