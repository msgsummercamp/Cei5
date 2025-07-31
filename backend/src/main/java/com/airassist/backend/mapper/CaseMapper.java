package com.airassist.backend.mapper;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.model.Case;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CaseMapper {
    CaseMapper INSTANCE = Mappers.getMapper(CaseMapper.class);
    Case toEntity(CaseDTO caseDTO);
}
