package com.airassist.backend.service;

import com.airassist.backend.dto.document.CreateDocumentDTO;
import com.airassist.backend.dto.document.DocumentDTO;
import com.airassist.backend.dto.document.DocumentSummaryDTO;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface DocumentService {
    /**
     * Adds a new document to the system.
     *
     * @param createDocumentDTO the DTO containing document creation details
     * @param caseId the ID of the case to which the document belongs
     * @return the created DocumentDTO
     * @throws IOException if there is an error during document creation
     */
    DocumentDTO addDocument(CreateDocumentDTO createDocumentDTO, UUID caseId) throws IOException;

    /**
     * Deletes a document from the system.
     *
     * @param documentId the ID of the document to be deleted
     */
    void deleteDocument(UUID documentId);

    /**
     * Retrieves a document by its ID.
     *
     * @param documentId the ID of the document to retrieve
     * @return the DocumentDTO containing document details
     */
    DocumentDTO getDocument(UUID documentId);

    /**
     * Retrieves a list of documents associated with a specific case.
     *
     * @param caseId the ID of the case for which to retrieve documents
     * @return a list of DocumentSummaryDTOs containing summaries of the documents
     */
    List<DocumentSummaryDTO> getDocumentsForCase(UUID caseId);
}
