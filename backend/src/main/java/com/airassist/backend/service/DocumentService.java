package com.airassist.backend.service;

import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import com.airassist.backend.model.Document;
import com.airassist.backend.model.enums.DocumentTypes;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentService {
    DocumentDTO addDocument(MultipartFile file, String name, DocumentTypes type, UUID caseId) throws IOException;
    void deleteDocument(UUID documentId);
    DocumentDTO getDocument(UUID documentId);
    List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId);
}
