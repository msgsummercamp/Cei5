package com.airassist.backend.mapper;

import com.airassist.backend.dto.beneficiary.BeneficiaryDTO;
import com.airassist.backend.model.Beneficiary;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface BeneficiaryMapper {
    BeneficiaryMapper INSTANCE = Mappers.getMapper(BeneficiaryMapper.class);

    /**
     * Converts a BeneficiaryDTO to a Beneficiary entity.
     *
     * @param beneficiary the BeneficiaryDTO to convert
     * @return the converted Beneficiary entity
     */
    Beneficiary toEntity(BeneficiaryDTO beneficiary);

    /**
     * Converts a Beneficiary entity to a BeneficiaryDTO.
     *
     * @param beneficiary the Beneficiary entity to convert
     * @return the converted BeneficiaryDTO
     */
    BeneficiaryDTO toDTO(Beneficiary beneficiary);
}
