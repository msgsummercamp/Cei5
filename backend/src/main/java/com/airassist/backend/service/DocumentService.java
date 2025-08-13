package com.airassist.backend.service;

import com.airassist.backend.dto.document.CreateDocumentDTO;
import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface DocumentService {
    DocumentDTO addDocument(CreateDocumentDTO createDocumentDTO, UUID caseId) throws IOException;
    void deleteDocument(UUID documentId);
    DocumentDTO getDocument(UUID documentId);
    List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId);
}
