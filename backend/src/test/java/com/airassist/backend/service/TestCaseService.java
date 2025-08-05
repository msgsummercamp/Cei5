package com.airassist.backend.service;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.mapper.ReservationMapper;
import com.airassist.backend.mapper.UserMapper;
import com.airassist.backend.model.User;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Statuses;
import com.airassist.backend.model.DisruptionReasons;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.repository.ReservationRepository;
import com.airassist.backend.service.impl.CaseServiceImpl;
import com.airassist.backend.testObjects.TestCaseFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class TestCaseService {

    private CaseRepository caseRepository;
    private UserRepository userRepository;
    private ReservationRepository reservationRepository;
    private CaseServiceImpl caseService;
    private CaseMapper caseMapper;
    private UserMapper userMapper;
    private ReservationMapper reservationMapper;

    @BeforeEach
    void setUp() {
        caseRepository = Mockito.mock(CaseRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        reservationRepository = Mockito.mock(ReservationRepository.class);
        caseMapper = Mockito.mock(CaseMapper.class);
        userMapper = Mockito.mock(UserMapper.class);
        reservationMapper = Mockito.mock(ReservationMapper.class);
        caseService = new CaseServiceImpl(caseRepository,caseMapper,reservationMapper);
        try {
            java.lang.reflect.Field userRepoField = CaseServiceImpl.class.getDeclaredField("userRepository");
            userRepoField.setAccessible(true);
            userRepoField.set(caseService, userRepository);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
        try {
            java.lang.reflect.Field reservationRepoField = CaseServiceImpl.class.getDeclaredField("reservationRepository");
            reservationRepoField.setAccessible(true);
            reservationRepoField.set(caseService, reservationRepository);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }



        TestCaseFactory.userMapper = userMapper;
        TestCaseFactory.reservationMapper = reservationMapper;
        User testUser = TestCaseFactory.createTestUser();
        Mockito.when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        Mockito.when(caseMapper.toEntity(Mockito.any(CaseDTO.class)))
                .thenAnswer(inv -> {
                    CaseDTO dto = inv.getArgument(0);
                    User client = userRepository.findById(dto.getClientID()).orElse(null);
                    User assignedColleague = dto.getAssignedColleague() != null
                            ? userMapper.userDTOToUser(dto.getAssignedColleague())
                            : null;
                    return Case.builder()
                            .id(UUID.randomUUID())
                            .status(dto.getStatus())
                            .disruptionReason(dto.getDisruptionReason())
                            .disruptionInfo(dto.getDisruptionInfo())
                            .date(dto.getDate())
                            .client(client)
                            .assignedColleague(assignedColleague)
                            .reservation(reservationMapper.toEntity(dto.getReservation()))
                            .documentList(dto.getDocumentList())
                            .build();
                });

        Mockito.when(caseRepository.save(Mockito.any(Case.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        Mockito.when(reservationMapper.toEntity(Mockito.any()))
                .thenReturn(TestCaseFactory.createTestReservation());
    }

    @Test
    void getCases_ReturnsPaginatedCases() {
        List<Case> cases = TestCaseFactory.createCaseList();
        Pageable pageable = Pageable.unpaged();
        Page<Case> casePage = new org.springframework.data.domain.PageImpl<>(cases, pageable, cases.size());

        Mockito.when(caseRepository.findAll(pageable)).thenReturn(casePage);

        Page<Case> result = caseService.getCases(pageable);

        assertThat(result.getContent(), hasSize(cases.size()));
    }

    @Test
    void getCaseById_CaseExists_ReturnsCase() {
        Case testCase = TestCaseFactory.createCase(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);
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
    void addCase_ValidCase_ReturnsSavedCase() {
        User testUser = TestCaseFactory.createTestUser();
        CaseDTO caseDTO = TestCaseFactory.createCaseDTO(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);
        caseDTO.setClientID(testUser.getId());
        Mockito.when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        Case caseEntity = TestCaseFactory.createCase(Statuses.VALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);
        Mockito.when(caseRepository.save(Mockito.any(Case.class))).thenReturn(caseEntity);

        Case saved = caseService.createCase(caseDTO);

        assertThat(saved.getStatus(), is(caseDTO.getStatus()));
        assertThat(saved.getDisruptionReason(), is(caseDTO.getDisruptionReason()));
        assertThat(saved.getDisruptionInfo(), is(caseDTO.getDisruptionInfo()));
    }

    @Test
    void updateCase_CaseExists_ValidUpdate_ReturnsUpdatedCase() throws CaseNotFoundException {
        CaseDTO updateDTO = TestCaseFactory.createCaseDTO(Statuses.VALID, DisruptionReasons.ARRIVED_3H_LATE);
        Case dbCase = TestCaseFactory.createCase(Statuses.INVALID, DisruptionReasons.CANCELATION_ON_DAY_OF_DEPARTURE);

        Mockito.when(caseRepository.findById(dbCase.getId())).thenReturn(Optional.of(dbCase));
        Mockito.when(caseRepository.save(Mockito.any(Case.class))).thenAnswer(inv -> inv.getArgument(0));

        Case updated = caseService.updateCase(updateDTO, dbCase.getId());

        assertThat(updated.getStatus(), is(updateDTO.getStatus()));
        assertThat(updated.getDisruptionReason(), is(updateDTO.getDisruptionReason()));
        assertThat(updated.getDisruptionInfo(), is(updateDTO.getDisruptionInfo()));
    }

    @Test
    void updateCase_CaseDoesNotExist_ThrowsCaseNotFoundException() {
        CaseDTO updateDTO = TestCaseFactory.createCaseDTO(Statuses.VALID, DisruptionReasons.ARRIVED_3H_LATE);
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