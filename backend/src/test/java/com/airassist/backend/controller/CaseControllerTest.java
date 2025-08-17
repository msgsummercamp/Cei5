package com.airassist.backend.controller;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.dto.cases.CaseResponseDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.mapper.CaseResponseMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.enums.Statuses;
import com.airassist.backend.service.CaseService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CaseControllerTest {

    @Mock
    private CaseService caseService;
    @Mock
    private CaseResponseMapper caseResponseMapper;
    @Mock
    private CaseMapper caseMapper;

    @InjectMocks
    private CaseController caseController;

    @Test
    void getCases_WhenCasesExist_ShouldReturnList() {
        Case c = new Case();
        CaseResponseDTO dto = new CaseResponseDTO();
        when(caseService.getCases()).thenReturn(List.of(c));
        when(caseResponseMapper.toCaseResponseDTO(c)).thenReturn(dto);

        ResponseEntity<List<CaseResponseDTO>> response = caseController.getCases();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(List.of(dto), response.getBody());
    }

    @Test
    void getCaseById_WhenCaseExists_ShouldReturnCaseResponseDTO() {
        UUID id = UUID.randomUUID();
        Case c = new Case();
        CaseResponseDTO dto = new CaseResponseDTO();
        when(caseService.getCaseById(id)).thenReturn(Optional.of(c));
        when(caseResponseMapper.toCaseResponseDTO(c)).thenReturn(dto);

        ResponseEntity<CaseResponseDTO> response = caseController.getCaseById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
    }

    @Test
    void getCaseById_WhenNotFound_ShouldReturnNotFound() {
        UUID id = UUID.randomUUID();
        when(caseService.getCaseById(id)).thenReturn(Optional.empty());

        ResponseEntity<CaseResponseDTO> response = caseController.getCaseById(id);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void createCase_WhenValid_ShouldReturnCreated() throws UserNotFoundException {
        CaseDTO dto = new CaseDTO();
        Case created = new Case();
        CaseResponseDTO responseDTO = new CaseResponseDTO();
        when(caseService.createCase(dto)).thenReturn(created);
        when(caseResponseMapper.toCaseResponseDTO(created)).thenReturn(responseDTO);

        ResponseEntity<CaseResponseDTO> response = caseController.createCase(dto);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
    }

    @Test
    void createCase_WhenUserNotFound_ShouldThrow() throws UserNotFoundException {
        CaseDTO dto = new CaseDTO();
        when(caseService.createCase(dto)).thenThrow(new UserNotFoundException());

        assertThrows(UserNotFoundException.class, () -> caseController.createCase(dto));
    }

    @Test
    void updateCase_WhenValid_ShouldReturnOk() {
        UUID id = UUID.randomUUID();
        CaseDTO dto = new CaseDTO();
        Case updated = new Case();
        CaseResponseDTO responseDTO = new CaseResponseDTO();
        when(caseService.updateCase(dto, id)).thenReturn(updated);
        when(caseResponseMapper.toCaseResponseDTO(updated)).thenReturn(responseDTO);

        ResponseEntity<CaseResponseDTO> response = caseController.updateCase(id, dto);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
    }

    @Test
    void updateCase_WhenNotFound_ShouldThrow() {
        UUID id = UUID.randomUUID();
        CaseDTO dto = new CaseDTO();
        when(caseService.updateCase(dto, id)).thenThrow(new CaseNotFoundException());

        assertThrows(CaseNotFoundException.class, () -> caseController.updateCase(id, dto));
    }

    @Test
    void deleteCase_WhenValid_ShouldReturnOk() {
        UUID id = UUID.randomUUID();

        ResponseEntity<Void> response = caseController.deleteCase(id);

        assertEquals(200, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(caseService).deleteCase(id);
    }

    @Test
    void deleteCase_WhenNotFound_ShouldThrow() {
        UUID id = UUID.randomUUID();
        doThrow(new CaseNotFoundException()).when(caseService).deleteCase(id);

        assertThrows(CaseNotFoundException.class, () -> caseController.deleteCase(id));
    }

    @Test
    void checkEligibility_WhenValid_ShouldReturnOk() {
        CaseDTO dto = new CaseDTO();
        Case entity = new Case();
        when(caseMapper.toEntity(dto)).thenReturn(entity);
        when(caseService.checkEligibility(entity)).thenReturn(true);

        ResponseEntity<Boolean> response = caseController.checkEligibility(dto);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody());
    }

    @Test
    void assignEmployeeToCase_WhenValid_ShouldReturnOk() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        UUID empId = UUID.randomUUID();
        Case changed = new Case();
        changed.setId(caseId);
        Case assigned = new Case();
        CaseResponseDTO responseDTO = new CaseResponseDTO();

        when(caseService.assignEmployee(caseId, empId)).thenReturn(changed);
        when(caseService.setCaseStatus(caseId, Statuses.ASSIGNED)).thenReturn(assigned);
        when(caseResponseMapper.toCaseResponseDTO(assigned)).thenReturn(responseDTO);

        ResponseEntity<CaseResponseDTO> response = caseController.assignEmployeeToCase(caseId, empId);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
    }

    @Test
    void assignEmployeeToCase_WhenUserNotFound_ShouldThrow() throws UserNotFoundException {
        UUID caseId = UUID.randomUUID();
        UUID empId = UUID.randomUUID();
        when(caseService.assignEmployee(caseId, empId)).thenThrow(new UserNotFoundException());

        assertThrows(UserNotFoundException.class, () -> caseController.assignEmployeeToCase(caseId, empId));
    }

    @Test
    void getAllCasesForClient_WhenCasesExist_ShouldReturnList() {
        UUID userId = UUID.randomUUID();
        Case c = new Case();
        CaseResponseDTO dto = new CaseResponseDTO();
        when(caseService.getCasesForClient(userId)).thenReturn(List.of(c));
        when(caseResponseMapper.toCaseResponseDTO(c)).thenReturn(dto);

        ResponseEntity<List<CaseResponseDTO>> response = caseController.getAllCasesForClient(userId);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(List.of(dto), response.getBody());
    }

    @Test
    void getAllCasesForClient_WhenNoCases_ShouldThrow() {
        UUID userId = UUID.randomUUID();
        when(caseService.getCasesForClient(userId)).thenThrow(new CaseNotFoundException());

        assertThrows(CaseNotFoundException.class, () -> caseController.getAllCasesForClient(userId));
    }

    @Test
    void setStatusForCase_WhenValid_ShouldReturnOk() {
        UUID caseId = UUID.randomUUID();
        Statuses status = Statuses.VALID;
        Case changed = new Case();
        CaseResponseDTO responseDTO = new CaseResponseDTO();
        when(caseService.setCaseStatus(caseId, status)).thenReturn(changed);
        when(caseResponseMapper.toCaseResponseDTO(changed)).thenReturn(responseDTO);

        ResponseEntity<CaseResponseDTO> response = caseController.setStatusForCase(caseId, status);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDTO, response.getBody());
    }

    @Test
    void setStatusForCase_WhenNotFound_ShouldThrow() {
        UUID caseId = UUID.randomUUID();
        Statuses status = Statuses.VALID;
        when(caseService.setCaseStatus(caseId, status)).thenThrow(new CaseNotFoundException());

        assertThrows(CaseNotFoundException.class, () -> caseController.setStatusForCase(caseId, status));
    }
}