package com.airassist.backend.repository;

import com.airassist.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByCaseEntityId(UUID caseId);
}
