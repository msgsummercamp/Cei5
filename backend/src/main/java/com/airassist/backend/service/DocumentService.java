package com.airassist.backend.service;

import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.model.Document;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentService {
    Document addDocument(Document document, UUID caseId);
    void deleteDocument(UUID documentId);
    Optional<Document> getDocument(UUID documentId);
    List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId);
}
