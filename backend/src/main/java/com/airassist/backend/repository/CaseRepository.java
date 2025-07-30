package com.airassist.backend.repository;

import com.airassist.backend.model.Case;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CaseRepository extends JpaRepository<Case, UUID> {
}
