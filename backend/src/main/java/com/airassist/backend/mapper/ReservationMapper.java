package com.airassist.backend.mapper;

import com.airassist.backend.dto.reservation.ReservationDTO;
import com.airassist.backend.model.Reservation;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {FlightMapper.class})
public interface ReservationMapper {
    Reservation toEntity(ReservationDTO dto);

    ReservationDTO toDTO(Reservation entity);

    @AfterMapping
    default void setFlightsReservation(@MappingTarget Reservation reservation, ReservationDTO dto) {
        if (reservation.getFlights() != null) {
            reservation.getFlights().forEach(flight -> flight.setReservation(reservation));
        }
    }
}
