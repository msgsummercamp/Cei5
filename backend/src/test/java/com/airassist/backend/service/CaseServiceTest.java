package com.airassist.backend.service;

import com.airassist.backend.dto.beneficiary.BeneficiaryDTO;
import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.dto.cases.CaseResponseDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.BeneficiaryMapper;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.mapper.ReservationMapper;
import com.airassist.backend.model.Beneficiary;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Reservation;
import com.airassist.backend.model.User;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.model.enums.Statuses;
import com.airassist.backend.model.enums.DisruptionReasons;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.repository.ReservationRepository;
import com.airassist.backend.service.impl.CaseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class CaseServiceTest {

    private CaseRepository caseRepository;
    private UserRepository userRepository;
    private ReservationRepository reservationRepository;
    private CaseServiceImpl caseService;
    private CaseMapper caseMapper;
    private ReservationMapper reservationMapper;
    private BeneficiaryMapper beneficiaryMapper;

    static User createTestUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("testuser@example.com");
        user.setPassword("password123");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(Roles.USER);
        user.setIsFirstLogin(true);
        return user;
    }

    static Beneficiary createTestBeneficiary() {
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setId(UUID.randomUUID());
        beneficiary.setFirstName("Test");
        beneficiary.setLastName("Beneficiary");
        beneficiary.setAddress("some address");
        beneficiary.setPostalCode("12345");
        beneficiary.setIsUnderage(true);
        return beneficiary;
    }

     static Reservation createTestReservation() {
        Reservation reservation = new Reservation();
        reservation.setId(UUID.randomUUID());
        reservation.setReservationNumber("ABC123");
        reservation.setFlights(List.of());
        return reservation;
    }

     static Case createCase(Statuses status, DisruptionReasons reason) {
        User client = createTestUser();
        Reservation reservation = createTestReservation();
        Beneficiary beneficiary = createTestBeneficiary();
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
                .beneficiary(beneficiary)
                .build();
    }

    CaseDTO createCaseDTO(Statuses status, DisruptionReasons reason) {
        User client = createTestUser();
        Reservation reservation = createTestReservation();
        Beneficiary beneficiary = createTestBeneficiary();
        CaseDTO dto = new CaseDTO();
        dto.setStatus(status);
        dto.setDisruptionReason(reason);
        dto.setDisruptionInfo("DTO disruption info");
        dto.setDate(LocalDate.now());
        dto.setClientID(client.getId());
        dto.setAssignedColleague(null);
        dto.setReservation(reservationMapper.toDTO(reservation));
        dto.setDocumentList(List.of());
        return dto;
    }

     static CaseResponseDTO createCaseResponseDTO(Statuses status, DisruptionReasons reason) {
        UUID id = UUID.randomUUID();
        User client = createTestUser();
        Reservation reservation = createTestReservation();
        Beneficiary beneficiary = createTestBeneficiary();
        CaseResponseDTO dto = new CaseResponseDTO();
        dto.setId(id);
        dto.setStatus(status);
        dto.setDisruptionReason(reason);
        dto.setDisruptionInfo("Response disruption info");
        dto.setDate(LocalDate.now());
        dto.setDocumentIds(List.of());
        dto.setBeneficiary(new BeneficiaryDTO(
                beneficiary.getId(),
                beneficiary.getFirstName(),
                beneficiary.getLastName(),
                beneficiary.getAddress(),
                beneficiary.getPostalCode(),
                beneficiary.getIsUnderage()
        ));
        return dto;
    }

     static List<Case> createCaseList() {
        return List.of(
                createCase(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE),
                createCase(Statuses.INVALID, DisruptionReasons.ARRIVED_3H_LATE)
        );
    }

    @BeforeEach
    void setUp() {
        caseRepository = Mockito.mock(CaseRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        reservationRepository = Mockito.mock(ReservationRepository.class);
        caseMapper = Mockito.mock(CaseMapper.class);
        reservationMapper = Mappers.getMapper(ReservationMapper.class);
        beneficiaryMapper = Mappers.getMapper(BeneficiaryMapper.class);
        caseService = new CaseServiceImpl(caseRepository, userRepository, caseMapper,reservationMapper, beneficiaryMapper);

        Mockito.when(caseMapper.toEntity(Mockito.any(CaseDTO.class)))
                .thenAnswer(inv -> {
                    CaseDTO dto = inv.getArgument(0);
                    User client = new User();
                    client.setId(dto.getClientID());

                    User assignedColleague = null;
                    if (dto.getAssignedColleague() != null) {
                        assignedColleague = new User();
                        assignedColleague.setEmail(dto.getAssignedColleague().getEmail());
                    }

                    Reservation reservation = reservationMapper.toEntity(dto.getReservation());
                    Beneficiary beneficiary = beneficiaryMapper.toEntity(dto.getBeneficiary());

                    return Case.builder()
                            .id(UUID.randomUUID())
                            .status(dto.getStatus())
                            .disruptionReason(dto.getDisruptionReason())
                            .disruptionInfo(dto.getDisruptionInfo())
                            .date(dto.getDate())
                            .client(client)
                            .assignedColleague(assignedColleague)
                            .reservation(reservation)
                            .documentList(dto.getDocumentList())
                            .beneficiary(beneficiary)
                            .build();
                });

        Mockito.when(caseRepository.save(Mockito.any(Case.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Mockito.when(userRepository.findById(Mockito.any(UUID.class)))
                .thenAnswer(inv -> {
                    UUID id = inv.getArgument(0);
                    User user = createTestUser();
                    user.setId(id);
                    return Optional.of(user);
                });
    }

    @Test
    void getCases_ReturnsPaginatedCases() {
        List<Case> cases = createCaseList();
        Pageable pageable = Pageable.unpaged();
        Page<Case> casePage = new org.springframework.data.domain.PageImpl<>(cases, pageable, cases.size());

        Mockito.when(caseRepository.findAll(pageable)).thenReturn(casePage);

        Page<Case> result = caseService.getCases(pageable);

        assertThat(result.getContent(), hasSize(cases.size()));
    }

    @Test
    void getCaseById_CaseExists_ReturnsCase() {
        Case testCase = createCase(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);
        Mockito.when(caseRepository.findById(testCase.getId())).thenReturn(Optional.of(testCase));

        Optional<Case> result = caseService.getCaseById(testCase.getId());

        assertThat(result.isPresent(), is(true));
        assertThat(result.get(), is(testCase));
    }

    @Test
    void getCaseById_CaseDoesNotExist_ReturnsEmptyOptional() {
        UUID id = UUID.randomUUID();
        Mockito.when(caseRepository.findById(id)).thenReturn(Optional.empty());

        Optional<Case> result = caseService.getCaseById(id);

        assertThat(result.isEmpty(), is(true));
    }

    @Test
    void addCase_ValidCase_ReturnsSavedCase() throws UserNotFoundException {
        CaseDTO caseDTO = createCaseDTO(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);
        Case caseEntity = createCase(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);

        Mockito.when(caseRepository.save(Mockito.any(Case.class))).thenReturn(caseEntity);

        Case saved = caseService.createCase(caseDTO);

        assertThat(saved.getStatus(), is(caseDTO.getStatus()));
        assertThat(saved.getDisruptionReason(), is(caseDTO.getDisruptionReason()));
        assertThat(saved.getDisruptionInfo(), is(caseDTO.getDisruptionInfo()));
    }

    @Test
    void updateCase_CaseExists_ValidUpdate_ReturnsUpdatedCase() throws CaseNotFoundException {
        CaseDTO updateDTO = createCaseDTO(Statuses.VALID, DisruptionReasons.ARRIVED_3H_LATE);
        Case dbCase = createCase(Statuses.INVALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);

        Mockito.when(caseRepository.findById(dbCase.getId())).thenReturn(Optional.of(dbCase));
        Mockito.when(caseRepository.save(Mockito.any(Case.class))).thenAnswer(inv -> inv.getArgument(0));

        Case updated = caseService.updateCase(updateDTO, dbCase.getId());

        assertThat(updated.getStatus(), is(updateDTO.getStatus()));
        assertThat(updated.getDisruptionReason(), is(updateDTO.getDisruptionReason()));
        assertThat(updated.getDisruptionInfo(), is(updateDTO.getDisruptionInfo()));
    }

    @Test
    void updateCase_CaseDoesNotExist_ThrowsCaseNotFoundException() {
        CaseDTO updateDTO = createCaseDTO(Statuses.VALID, DisruptionReasons.ARRIVED_3H_LATE);
        UUID id = UUID.randomUUID();

        Mockito.when(caseRepository.findById(id)).thenReturn(Optional.empty());

        Exception thrown = assertThrows(
                CaseNotFoundException.class,
                () -> caseService.updateCase(updateDTO, id)
        );
        assertThat(thrown.getMessage(), containsString("not found"));
    }

    @Test
    void deleteCase_CaseExists_DeletesCase() throws CaseNotFoundException {
        UUID id = UUID.randomUUID();
        Mockito.when(caseRepository.existsById(id)).thenReturn(true);

        caseService.deleteCase(id);

        Mockito.verify(caseRepository).deleteById(id);
    }

    @Test
    void deleteCase_CaseDoesNotExist_ThrowsCaseNotFoundException() {
        UUID id = UUID.randomUUID();
        Mockito.when(caseRepository.existsById(id)).thenReturn(false);

        Exception thrown = assertThrows(
                CaseNotFoundException.class,
                () -> caseService.deleteCase(id)
        );
        assertThat(thrown.getMessage(), containsString("not found"));
    }
}