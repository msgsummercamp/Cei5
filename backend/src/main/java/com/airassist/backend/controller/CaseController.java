package com.airassist.backend.controller;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.dto.cases.CaseResponseDTO;
import com.airassist.backend.mapper.CaseResponseMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.service.CaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final CaseResponseMapper caseResponseMapper;

    @GetMapping
    public ResponseEntity<List<CaseResponseDTO>> getCases(Pageable pageable) {
        Page<Case> casePage = caseService.getCases(pageable);
        Page<CaseResponseDTO> caseResponseDTOPage = casePage.map(caseResponseMapper::toCaseResponseDTO);
        if (caseResponseDTOPage.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(caseResponseDTOPage.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> getCaseById(@PathVariable UUID id) {
        return caseService.getCaseById(id)
                .map(caseEntity -> ResponseEntity.ok(caseResponseMapper.toCaseResponseDTO(caseEntity)))
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public ResponseEntity<CaseResponseDTO> createCase(@Valid @RequestBody CaseDTO caseRequest) {
        Case createdCase = caseService.createCase(caseRequest);
        CaseResponseDTO createdCaseResponse = caseResponseMapper.toCaseResponseDTO(createdCase);
        return ResponseEntity.status(201).body(createdCaseResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> updateCase(@PathVariable UUID id, @Valid @RequestBody CaseDTO caseRequest) {
        Case updatedCase = caseService.updateCase(caseRequest, id);
        CaseResponseDTO updatedCaseResponse = caseResponseMapper.toCaseResponseDTO(updatedCase);
        return ResponseEntity.ok(updatedCaseResponse);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(
            @PathVariable UUID id){
        caseService.deleteCase(id);
        return ResponseEntity.ok().build();
    }
}
