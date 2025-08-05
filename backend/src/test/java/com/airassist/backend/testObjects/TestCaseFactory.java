package com.airassist.backend.testObjects;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.dto.cases.CaseResponseDTO;
import com.airassist.backend.dto.reservation.ReservationDTO;
import com.airassist.backend.mapper.ReservationMapper;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.*;
import com.airassist.backend.model.enums.DisruptionReasons;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.model.enums.Statuses;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class TestCaseFactory {

    public static UserMapper userMapper;
    public static ReservationMapper reservationMapper;
    public static User createTestUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("testuser@example.com");
        user.setPassword("password123");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(Roles.USER);
        user.setFirstLogin(true);
        return user;
    }

    public static Reservation createTestReservation() {
        Reservation reservation = new Reservation();
        reservation.setId(UUID.randomUUID());
        reservation.setReservationNumber("ABC123");
        reservation.setFlights(List.of());
        return reservation;
    }

    public static Case createCase(Statuses status, DisruptionReasons reason) {
        User client = createTestUser();
        Reservation reservation = createTestReservation();
        return Case.builder()
                .id(UUID.randomUUID())
                .status(status)
                .disruptionReason(reason)
                .disruptionInfo("DTO disruption info")
                .date(LocalDate.now())
                .client(client)
                .assignedColleague(null)
                .reservation(reservation)
                .documentList(List.of())
                .build();
    }

    public static CaseDTO createCaseDTO(Statuses status, DisruptionReasons reason) {
        User client = createTestUser();
        Reservation reservation = createTestReservation();
        ReservationDTO reservationDTO = reservationMapper.toDTO(reservation);
        CaseDTO dto = new CaseDTO();
        dto.setStatus(status);
        dto.setDisruptionReason(reason);
        dto.setDisruptionInfo("DTO disruption info");
        dto.setDate(LocalDate.now());
        dto.setClientID(client.getId());
        dto.setAssignedColleague(null);
        dto.setReservation(reservationDTO);
        dto.setDocumentList(List.of());
        return dto;
    }

    public static CaseResponseDTO createCaseResponseDTO(Statuses status, DisruptionReasons reason) {
        UUID id = UUID.randomUUID();
        User client = createTestUser();
        Reservation reservation = createTestReservation();
        CaseResponseDTO dto = new CaseResponseDTO();
        dto.setId(id);
        dto.setStatus(status);
        dto.setDisruptionReason(reason);
        dto.setDisruptionInfo("Response disruption info");
        dto.setDate(LocalDate.now());
        dto.setClientId(client.getId());
        dto.setAssignedColleagueId(null);
        dto.setReservationId(reservation.getId());
        dto.setDocumentIds(List.of());
        return dto;
    }

    public static List<Case> createCaseList() {
        return List.of(
                createCase(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE),
                createCase(Statuses.INVALID, DisruptionReasons.ARRIVED_3H_LATE)
        );
    }
}