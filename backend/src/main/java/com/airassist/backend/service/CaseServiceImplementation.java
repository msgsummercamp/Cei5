package com.airassist.backend.service;

import com.airassist.backend.dto.CaseDTO;
import com.airassist.backend.exception.CaseNotFoundException;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.model.Case;
import com.airassist.backend.model.Statuses;
import com.airassist.backend.repository.CaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;


@Service
public class CaseServiceImplementation implements CaseService {
    private final CaseRepository caseRepository;
    private final CaseMapper caseMapper;
    private static final Logger logger = LoggerFactory.getLogger(CaseServiceImplementation.class);


    public CaseServiceImplementation(CaseRepository caseRepository, CaseMapper caseMapper) {
        this.caseRepository = caseRepository;
        this.caseMapper = caseMapper;
    }

    @Override
    public Page<Case> getCases(Pageable pageable) throws CaseNotFoundException {
        logger.info("Service - fetching all cases with pagination: {}", pageable);
        return caseRepository.findAll(pageable);
    }

    @Override
    public Optional<Case> getCaseById(UUID id) throws CaseNotFoundException {
        logger.info("Service - getting case by ID: {}", id);
        return caseRepository.findById(id);
    }

    @Override
    public Case createCase(CaseDTO caseDTO) {
        Case newCase;
        Case caseToAdd = caseMapper.toEntity(caseDTO);
        logger.info("Service - creating a new case: {}", caseToAdd);
        if (checkEligibility(caseToAdd)) {
            caseToAdd.setStatus(Statuses.VALID);
        }else {
            caseToAdd.setStatus(Statuses.INVALID);
        }
        newCase = caseRepository.save(caseToAdd);
        return newCase;
    }

    @Override
    public Case updateCase(CaseDTO caseDTO, UUID id) throws CaseNotFoundException {
        Case updatedCase;

        Case updateReqCase = caseMapper.toEntity(caseDTO);
        updateReqCase.setId(id);
        Case caseToUpdate = caseRepository.findById(id).orElseThrow(() -> {
            logger.warn("Service - Case with ID {} not found for update", id);
            return new CaseNotFoundException("Case with ID " + id + " not found for deletion");
        });
        updateCaseFields(updateReqCase, caseToUpdate);
        logger.info("Service - updating case with ID: {}", id);
        updatedCase = caseRepository.save(caseToUpdate);


        return updatedCase;
    }

    @Override
    public void deleteCase(UUID id) throws CaseNotFoundException {
        if (!caseRepository.existsById(id)) {
            logger.warn(("Service - Attempted to delete a case with non-existing ID: {}"), id);
            throw new CaseNotFoundException("Case with ID " + id + " not found for deletion");
        }
        logger.info("Service - deleting case: {}", id);
        caseRepository.deleteById(id);
    }

    @Override
    public boolean checkEligibility(Case caseEntity) {
        return switch (caseEntity.getDisruptionReason()) {
            case CANCELATION_ON_DAY_OF_DEPARTURE -> true;
            case CANCELATION_NOTICE_UNDER_14_DAYS -> true;
            case ARRIVED_3H_LATE -> true;
            case NEVER_ARRIVED -> true;
            case DID_NOT_GIVE_THE_SEAT_VOLUNTARILY -> true;
            default -> false;
        };
    }

    private void updateCaseFields(Case source, Case target) {
        target.setStatus(source.getStatus());
        target.setDisruptionReason(source.getDisruptionReason());
        target.setDisruptionInfo(source.getDisruptionInfo());
        target.setDate(source.getDate());
        target.setClient(source.getClient());
        target.setAssignedColleague(source.getAssignedColleague());
        target.setReservation(source.getReservation());
        target.setDocumentList(source.getDocumentList());
    }


}
