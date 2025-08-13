package com.airassist.backend.service.impl;

import com.airassist.backend.dto.cases.CaseDTO;
import com.airassist.backend.exception.cases.CaseNotFoundException;
import com.airassist.backend.exception.user.UserNotFoundException;
import com.airassist.backend.mapper.BeneficiaryMapper;
import com.airassist.backend.mapper.CaseMapper;
import com.airassist.backend.mapper.ReservationMapper;
import com.airassist.backend.model.*;
import com.airassist.backend.model.enums.ApiErrorMessages;
import com.airassist.backend.model.enums.Roles;
import com.airassist.backend.model.enums.Statuses;
import com.airassist.backend.repository.CaseRepository;
import com.airassist.backend.service.CaseService;
import com.airassist.backend.repository.ReservationRepository;
import com.airassist.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
public class CaseServiceImpl implements CaseService {
    private final CaseRepository caseRepository;
    private final CaseMapper caseMapper;
    private static final Logger logger = LoggerFactory.getLogger(CaseServiceImpl.class);
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;
    private final BeneficiaryMapper beneficiaryMapper;
    private ReservationRepository reservationRepository;


    public CaseServiceImpl(CaseRepository caseRepository, UserRepository userRepository, CaseMapper caseMapper, ReservationMapper reservationMapper, BeneficiaryMapper beneficiaryMapper) {
        this.caseRepository = caseRepository;
        this.caseMapper = caseMapper;
        this.reservationMapper = reservationMapper;
        this.beneficiaryMapper = beneficiaryMapper;
        this.userRepository = userRepository;
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

    public Case createCase(CaseDTO caseDTO) throws UserNotFoundException {
        Case caseToAdd = caseMapper.toEntity(caseDTO);
        Reservation reservation = reservationMapper.toEntity(caseDTO.getReservation());
        Beneficiary beneficiary = beneficiaryMapper.toEntity(caseDTO.getBeneficiary());

        if (reservation.getFlights() != null) {
            reservation.getFlights().forEach(flight -> flight.setReservation(reservation));
        }
        caseToAdd.setReservation(reservation);

        User client = userRepository.findById(caseDTO.getClientID())
                .orElseThrow(() -> new UserNotFoundException());
        caseToAdd.setClient(client);

        if (reservation.getId() != null) {
            boolean exists = reservationRepository.existsById(reservation.getId());
            if (exists) {
                Reservation existingReservation = reservationRepository.findById(reservation.getId())
                        .orElseThrow(() -> new EntityNotFoundException(ApiErrorMessages.RESERVATION_NOT_FOUND.getCode()));
                caseToAdd.setReservation(existingReservation);
            } else {
                reservation.setId(null);
                caseToAdd.setReservation(reservation);
            }
        }

        if (reservation.getReservationNumber() == null || reservation.getReservationNumber().length() != 6) {
            throw new IllegalArgumentException("Reservation number must be exactly 6 characters");
        }
        if (reservation.getFlights() != null) {
            for (Flight flight : reservation.getFlights()) {
                if (flight.getFlightDate() == null ||
                        flight.getFlightNumber() == null ||
                        flight.getDepartingAirport() == null ||
                        flight.getDestinationAirport() == null ||
                        flight.getDepartureTime() == null ||
                        flight.getArrivalTime() == null ||
                        flight.getAirLine() == null) {
                    throw new IllegalArgumentException("Missing required flight field");
                }
            }
        }

        caseToAdd.setBeneficiary(beneficiary);

        logger.info("Service - creating a new case: {}", caseToAdd);
        caseToAdd.setStatus(checkEligibility(caseToAdd) ? Statuses.VALID : Statuses.INVALID);
        return caseRepository.save(caseToAdd);
    }

    @Override
    public Case updateCase(CaseDTO caseDTO, UUID id) throws CaseNotFoundException {
        Case updateReqCase = caseMapper.toEntity(caseDTO);
        updateReqCase.setId(id);
        Case caseToUpdate = caseRepository.findById(id).orElseThrow(() -> {
            logger.warn("Service - Case with ID {} not found for update", id);
            return new CaseNotFoundException();
        });
        updateCaseFields(updateReqCase, caseToUpdate);
        logger.info("Service - updating case with ID: {}", id);
        Case updatedCase = caseRepository.save(caseToUpdate);


        return updatedCase;
    }

    @Override
    public void deleteCase(UUID id) throws CaseNotFoundException {
        if (!caseRepository.existsById(id)) {
            logger.warn(("Service - Attempted to delete a case with non-existing ID: {}"), id);
            throw new CaseNotFoundException();
        }
        logger.info("Service - deleting case: {}", id);
        caseRepository.deleteById(id);
    }

    @Override
    public boolean checkEligibility(Case caseEntity) {
        return switch (caseEntity.getDisruptionReason()) {
            case CANCELLATION_UNDER_14_DAYS_AND_OVER_3H -> true;
            case CANCELLATION_UNDER_14_DAYS_AND_NEVER_ARRIVED ->  true;
            case CANCELLATION_ON_DAY_OF_DEPARTURE_AND_OVER_3H -> true;
            case CANCELLATION_ON_DAY_OF_DEPARTURE_AND_NEVER_ARRIVED -> true;
            case ARRIVED_3H_LATE -> true;
            case NEVER_ARRIVED -> true;
            case OVERBOOKING -> true;
            case DENIED_BOARDING_WITHOUT_REASON -> true;
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
        target.setBeneficiary(source.getBeneficiary());
    }

    @Override
    public Case assignEmployee(UUID caseId, UUID employeeId) throws CaseNotFoundException, UserNotFoundException {
        Case caseEntity = caseRepository.findById(caseId).orElseThrow(() -> {
            logger.warn("Service - Case with ID {} not found for update", caseId);
            return new CaseNotFoundException();
        });

        User employee = userRepository.findById(employeeId).orElseThrow(() -> {
            logger.warn("Service - Employee with ID {} not found", employeeId);
            return new UserNotFoundException();
        });

        if(employee.getRole() != Roles.EMPLOYEE) {
            logger.warn("User with ID {} does not have EMPLOYEE role", employeeId);
            throw new IllegalArgumentException("User is not an employee.");
        }

        caseEntity.setAssignedColleague(employee);
        caseRepository.save(caseEntity);
        logger.info("Case with ID {} has an employee assigned: {}", caseId, employeeId);

        return caseEntity;
    }

    public List<Case> getCasesForClient(UUID clientId) {
        List<Case> cases = caseRepository.getCasesByClientId(clientId);
        logger.info("Service - fetching all cases for client {}", clientId);

        if(cases.isEmpty()) {
            logger.warn("There are no cases for the client: {}", clientId);
            throw new CaseNotFoundException();
        }

        return cases;
    }

    public Case setCaseStatus(UUID caseId, Statuses status) {
        Case caseEntity = caseRepository.findById(caseId).orElseThrow(() -> {
            logger.warn("Service - Case with ID {} not found for update", caseId);
            return new CaseNotFoundException();
        });

        caseEntity.setStatus(status);
        caseRepository.save(caseEntity);
        return caseEntity;
    }
}
