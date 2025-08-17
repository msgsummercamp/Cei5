package com.airassist.backend.service;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.BeneficiaryMapper;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.mapper.ReservationMapper;
import com.airassist.backend.model.*;
import com.airassist.backend.model.enums.DisruptionReasons;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.model.enums.Statuses;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.repository.ReservationRepository;
import com.airassist.backend.repository.UserRepository;
import com.airassist.backend.service.impl.CaseServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CaseServiceTest {

    @Mock
    private CaseRepository caseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private CaseMapper caseMapper;
    @Mock
    private ReservationMapper reservationMapper;
    @Mock
    private BeneficiaryMapper beneficiaryMapper;

    @InjectMocks
    private CaseServiceImpl caseService;

    private void injectReservationRepository() {
        try {
            var field = CaseServiceImpl.class.getDeclaredField("reservationRepository");
            field.setAccessible(true);
            field.set(caseService, reservationRepository);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void getCases_WhenCasesExist_ShouldReturnList() {
        List<Case> cases = List.of(new Case());
        when(caseRepository.findAll()).thenReturn(cases);

        List<Case> result = caseService.getCases();

        assertEquals(cases, result);
    }

    @Test
    void getCaseById_WhenCaseExists_ShouldReturnOptional() {
        UUID id = UUID.randomUUID();
        Case c = new Case();
        when(caseRepository.findById(id)).thenReturn(Optional.of(c));

        Optional<Case> result = caseService.getCaseById(id);

        assertTrue(result.isPresent());
        assertEquals(c, result.get());
    }

    @Test
    void createCase_WhenValidInputs_ShouldCreateAndReturnCase() throws UserNotFoundException {
        injectReservationRepository();
        CaseDTO dto = mock(CaseDTO.class);
        Reservation reservation = new Reservation();
        reservation.setReservationNumber("ABCDEF");
        reservation.setFlights(new ArrayList<>());
        Beneficiary beneficiary = new Beneficiary();
        Case caseEntity = new Case();
        User client = new User();
        client.setRole(Roles.USER);

        when(caseMapper.toEntity(dto)).thenReturn(caseEntity);
        when(reservationMapper.toEntity(any())).thenReturn(reservation);
        when(beneficiaryMapper.toEntity(any())).thenReturn(beneficiary);
        when(dto.getClientID()).thenReturn(UUID.randomUUID());
        when(userRepository.findById(any())).thenReturn(Optional.of(client));
        when(dto.getReservation()).thenReturn(null);
        when(dto.getBeneficiary()).thenReturn(null);
        when(caseRepository.save(any(Case.class))).thenReturn(caseEntity);

        caseEntity.setDisruptionReason(DisruptionReasons.ARRIVED_3H_LATE);
        Case result = caseService.createCase(dto);

        assertNotNull(result);
    }

    @Test
    void createCase_WhenUserNotFound_ShouldThrowUserNotFoundException() {
        injectReservationRepository();
        CaseDTO dto = mock(CaseDTO.class);
        Reservation reservation = new Reservation();
        reservation.setReservationNumber("ABCDEF");
        when(caseMapper.toEntity(dto)).thenReturn(new Case());
        when(reservationMapper.toEntity(any())).thenReturn(reservation);
        when(dto.getClientID()).thenReturn(UUID.randomUUID());
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        when(dto.getReservation()).thenReturn(null);
        when(dto.getBeneficiary()).thenReturn(null);

        assertThrows(UserNotFoundException.class, () -> caseService.createCase(dto));
    }

    @Test
    void createCase_WhenReservationNumberInvalid_ShouldThrowIllegalArgumentException() {
        injectReservationRepository();
        CaseDTO dto = mock(CaseDTO.class);
        Reservation reservation = new Reservation();
        reservation.setReservationNumber("123");
        when(caseMapper.toEntity(dto)).thenReturn(new Case());
        when(reservationMapper.toEntity(any())).thenReturn(reservation);
        when(dto.getClientID()).thenReturn(UUID.randomUUID());
        when(userRepository.findById(any())).thenReturn(Optional.of(new User()));
        when(dto.getReservation()).thenReturn(null);
        when(dto.getBeneficiary()).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> caseService.createCase(dto));
    }

    @Test
    void createCase_WhenReservationExists_ShouldUseExistingReservation() throws UserNotFoundException {
        injectReservationRepository();
        CaseDTO dto = mock(CaseDTO.class);
        Reservation reservation = new Reservation();
        reservation.setId(UUID.randomUUID());
        reservation.setReservationNumber("ABCDEF");
        Beneficiary beneficiary = new Beneficiary();
        Case caseEntity = new Case();
        User client = new User();
        client.setRole(Roles.USER);

        when(caseMapper.toEntity(dto)).thenReturn(caseEntity);
        when(reservationMapper.toEntity(any())).thenReturn(reservation);
        when(beneficiaryMapper.toEntity(any())).thenReturn(beneficiary);
        when(dto.getClientID()).thenReturn(UUID.randomUUID());
        when(userRepository.findById(any())).thenReturn(Optional.of(client));
        when(reservationRepository.existsById(reservation.getId())).thenReturn(true);
        when(reservationRepository.findById(reservation.getId())).thenReturn(Optional.of(reservation));
        when(dto.getReservation()).thenReturn(null);
        when(dto.getBeneficiary()).thenReturn(null);
        when(caseRepository.save(any(Case.class))).thenReturn(caseEntity);

        caseEntity.setDisruptionReason(DisruptionReasons.ARRIVED_3H_LATE);
        Case result = caseService.createCase(dto);

        assertNotNull(result);
    }

    @Test
    void deleteCase_WhenCaseExists_ShouldDelete() {
        UUID id = UUID.randomUUID();
        when(caseRepository.existsById(id)).thenReturn(true);

        assertDoesNotThrow(() -> caseService.deleteCase(id));
    }

    @Test
    void deleteCase_WhenCaseNotFound_ShouldThrowCaseNotFoundException() {
        UUID id = UUID.randomUUID();
        when(caseRepository.existsById(id)).thenReturn(false);

        assertThrows(CaseNotFoundException.class, () -> caseService.deleteCase(id));
    }

    @Test
    void assignEmployee_WhenCaseAndEmployeeExist_ShouldAssignAndReturnCase() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        UUID empId = UUID.randomUUID();
        Case c = new Case();
        User emp = new User();
        emp.setRole(Roles.EMPLOYEE);

        when(caseRepository.findById(caseId)).thenReturn(Optional.of(c));
        when(userRepository.findById(empId)).thenReturn(Optional.of(emp));
        when(caseRepository.save(c)).thenReturn(c);

        Case result = caseService.assignEmployee(caseId, empId);

        assertEquals(c, result);
        assertEquals(emp, c.getAssignedColleague());
    }

    @Test
    void assignEmployee_WhenCaseNotFound_ShouldThrowCaseNotFoundException() {
        UUID caseId = UUID.randomUUID();
        UUID empId = UUID.randomUUID();
        when(caseRepository.findById(caseId)).thenReturn(Optional.empty());

        assertThrows(CaseNotFoundException.class, () -> caseService.assignEmployee(caseId, empId));
    }

    @Test
    void assignEmployee_WhenUserNotFound_ShouldThrowUserNotFoundException() {
        UUID caseId = UUID.randomUUID();
        UUID empId = UUID.randomUUID();
        Case c = new Case();
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(c));
        when(userRepository.findById(empId)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> caseService.assignEmployee(caseId, empId));
    }

    @Test
    void assignEmployee_WhenUserIsNotEmployee_ShouldThrowIllegalArgumentException() {
        UUID caseId = UUID.randomUUID();
        UUID empId = UUID.randomUUID();
        Case c = new Case();
        User notEmp = new User();
        notEmp.setRole(Roles.USER);

        when(caseRepository.findById(caseId)).thenReturn(Optional.of(c));
        when(userRepository.findById(empId)).thenReturn(Optional.of(notEmp));

        assertThrows(IllegalArgumentException.class, () -> caseService.assignEmployee(caseId, empId));
    }

    @Test
    void getCasesForClient_WhenCasesExist_ShouldReturnCases() {
        UUID clientId = UUID.randomUUID();
        List<Case> cases = List.of(new Case());
        when(caseRepository.getCasesByClientId(clientId)).thenReturn(cases);

        List<Case> result = caseService.getCasesForClient(clientId);

        assertEquals(cases, result);
    }

    @Test
    void setCaseStatus_WhenCaseExists_ShouldSetStatus() {
        UUID caseId = UUID.randomUUID();
        Case c = new Case();
        when(caseRepository.findById(caseId)).thenReturn(Optional.of(c));
        when(caseRepository.save(c)).thenReturn(c);

        Case result = caseService.setCaseStatus(caseId, Statuses.VALID);

        assertEquals(Statuses.VALID, result.getStatus());
    }

    @Test
    void setCaseStatus_WhenCaseNotFound_ShouldThrowCaseNotFoundException() {
        UUID caseId = UUID.randomUUID();
        when(caseRepository.findById(caseId)).thenReturn(Optional.empty());

        assertThrows(CaseNotFoundException.class, () -> caseService.setCaseStatus(caseId, Statuses.VALID));
    }
}