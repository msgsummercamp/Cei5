package com.airassist.backend.mapper;

import com.airassist.backend.dto.flight.FlightDTO;
import com.airassist.backend.model.Flight;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FlightMapper {
    Flight toEntity(FlightDTO dto);

    FlightDTO toDTO(Flight entity);
}