package com.airassist.backend.controller;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.dto.cases.CaseResponseDTO;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.mapper.CaseResponseMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.enums.Statuses;
import com.airassist.backend.service.CaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor

public class CaseController {

    private final CaseService caseService;
    private final CaseResponseMapper caseResponseMapper;
    private final CaseMapper caseMapper;

    /**
     * Retrieves all cases.
     *
     * @return ResponseEntity containing a list of CaseResponseDTOs
     */
    @GetMapping
    public ResponseEntity<List<CaseResponseDTO>> getCases() {
        List<Case> caseList = caseService.getCases();
        List<CaseResponseDTO> caseResponseDTOList = caseList.stream().map(caseResponseMapper::toCaseResponseDTO).toList();
        return ResponseEntity.ok(caseResponseDTOList);
    }

    /**
     * Retrieves a case by its ID.
     *
     * @param id the UUID of the case to retrieve
     * @return ResponseEntity containing the CaseResponseDTO if found, or 404 Not Found if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> getCaseById(@PathVariable UUID id) {
        return caseService.getCaseById(id)
                .map(caseEntity -> ResponseEntity.ok(caseResponseMapper.toCaseResponseDTO(caseEntity)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Creates a new case.
     *
     * @param caseRequest the CaseDTO containing the details of the case to create
     * @return ResponseEntity containing the created CaseResponseDTO
     * @throws UserNotFoundException if the user associated with the case is not found
     */
    @PostMapping
    public ResponseEntity<CaseResponseDTO> createCase(@Valid @RequestBody CaseDTO caseRequest) throws UserNotFoundException {
        Case createdCase = caseService.createCase(caseRequest);
        CaseResponseDTO createdCaseResponse = caseResponseMapper.toCaseResponseDTO(createdCase);
        return ResponseEntity.status(201).body(createdCaseResponse);
    }

    /**
     * Deletes a case by its ID.
     *
     * @param id the UUID of the case to delete
     * @return ResponseEntity with status 200 OK if deletion was successful
     */
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(
            @PathVariable UUID id){
        caseService.deleteCase(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Checks the eligibility of a case.
     *
     * @param caseDTO the CaseDTO containing the details of the case to check
     * @return ResponseEntity containing a boolean indicating eligibility
     */
    @PostMapping("/check-eligibility")
    public ResponseEntity<Boolean> checkEligibility(@RequestBody CaseDTO caseDTO) {
        boolean eligible = caseService.checkEligibility(caseMapper.toEntity(caseDTO));
        return ResponseEntity.ok(eligible);
    }

    /**
     * Assigns an employee to a case.
     *
     * @param caseId the UUID of the case to assign the employee to
     * @param employeeId the UUID of the employee to assign
     * @return ResponseEntity containing the updated CaseResponseDTO
     * @throws UserNotFoundException if the employee is not found
     */
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @PatchMapping("/{caseId}/assign-employee/{employeeId}")
    public ResponseEntity<CaseResponseDTO> assignEmployeeToCase(@PathVariable UUID caseId, @PathVariable UUID employeeId) throws UserNotFoundException {
        Case changedCase = caseService.assignEmployee(caseId, employeeId);
        changedCase = caseService.setCaseStatus(changedCase.getId(), Statuses.ASSIGNED);
        CaseResponseDTO updatedCaseResponse = caseResponseMapper.toCaseResponseDTO(changedCase);
        return ResponseEntity.ok(updatedCaseResponse);
    }

    /**
     * Retrieves all cases for a specific client.
     *
     * @param userId the UUID of the user (client) to retrieve cases for
     * @return ResponseEntity containing a list of CaseResponseDTOs for the specified client
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CaseResponseDTO>> getAllCasesForClient(@PathVariable UUID userId) {
        List<Case> userCases = caseService.getCasesForClient(userId);
        List<CaseResponseDTO> userCaseDTOs = userCases.stream()
                .map(caseResponseMapper::toCaseResponseDTO)
                .toList();
        return ResponseEntity.ok(userCaseDTOs);
    }

    /**
     * Sets the status of a case.
     *
     * @param caseId the UUID of the case to update
     * @param status the new status to set for the case
     * @return ResponseEntity containing the updated CaseResponseDTO
     */
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @PatchMapping("/{caseId}/{status}")
    public ResponseEntity<CaseResponseDTO> setStatusForCase(@PathVariable UUID caseId, @PathVariable Statuses status) {
        Case changedCase = caseService.setCaseStatus(caseId, status);
        CaseResponseDTO responseCase = caseResponseMapper.toCaseResponseDTO(changedCase);
        return ResponseEntity.ok(responseCase);
    }
}
