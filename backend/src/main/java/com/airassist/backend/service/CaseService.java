package com.airassist.backend.service;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.model.Case;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseService {

    Page<Case> getCases(Pageable pageable);

    Optional<Case> getCaseById(UUID id);

    Case createCase(CaseDTO caseDTO);

    Case updateCase(CaseDTO caseDTO, UUID id);

    void deleteCase(UUID id);

    boolean checkEligibility(Case caseEntity);

    Case assignEmployee(UUID caseId, UUID employeeId);

    List<Case> getCasesForClient(UUID clientId);
}
