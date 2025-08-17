package com.airassist.backend.repository;

import com.airassist.backend.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
}
